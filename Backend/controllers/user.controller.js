import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import { Job } from "../models/job.model.js";
import { storeImageSecurely, storeFileSecurely } from "../utils/fileStorage.js";

const passwordRequirements = /^[A-Z](?=.*\d)(?=.*[^A-Za-z0-9\s]).*$/;

const getCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.COOKIE_SAME_SITE || "lax"
});

/**
 * Validates phone numbers:
 * - Accepts standard 10-15 digit formats
 * - Allows leading +, spaces, hyphens, and brackets
 * - Ensures at least 10 pure digits are provided
 */
export const validatePhoneNumber = (phone) => {
    if (!phone) {
        return { isValid: false, message: "Phone number is required." };
    }
    const cleanStr = String(phone).trim();
    const digitsOnly = cleanStr.replace(/\D/g, "");
    if (digitsOnly.length < 10) {
        return { isValid: false, message: "Phone number must contain at least 10 digits." };
    }
    if (digitsOnly.length > 15) {
        return { isValid: false, message: "Phone number cannot exceed 15 digits." };
    }
    const phoneRegex = /^(\+?[1-9]\d{0,3}[-.\s]?)?(\(?\d{2,4}\)?[-.\s]?)?[\d\s.-]{7,12}$/;
    if (!phoneRegex.test(cleanStr)) {
        return { isValid: false, message: "Please enter a valid phone number (e.g. 9876543210 or +91 9876543210)." };
    }
    return { isValid: true, cleanPhone: cleanStr };
};

// ================= REGISTER =================
export const register = async (req, res) => {
    try {
        const { fullName, password, role } = req.body;
        const email = req.body.email?.trim().toLowerCase();
        const phoneNumber = req.body.phoneNumber ? String(req.body.phoneNumber).trim() : "";

        if (
            typeof fullName !== "string" ||
            !fullName.trim() ||
            fullName.trim().length > 120 ||
            !email ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
            !phoneNumber ||
            !password ||
            !role
        ) {
            return res.status(400).json({
                message: "Enter a valid name, email, phone number, password, and account role.",
                success: false
            });
        }

        if (!passwordRequirements.test(password)) {
            return res.status(400).json({
                message: "Password must start with an uppercase letter and include at least one number and symbol.",
                success: false
            });
        }

        const phoneValidation = validatePhoneNumber(phoneNumber);
        if (!phoneValidation.isValid) {
            return res.status(400).json({
                message: phoneValidation.message,
                success: false
            });
        }

        if (!["student", "recruiter"].includes(role)) {
            return res.status(400).json({
                message: "Choose a valid account role.",
                success: false
            });
        }

        const file = req.file;
        let profilePhoto = "";

        if (file) {
            if (!file.mimetype.startsWith("image/")) {
                return res.status(400).json({
                    message: "Profile photo must be an image.",
                    success: false
                });
            }
            try {
                const stored = await storeImageSecurely(file, "profile", "profiles");
                profilePhoto = stored.fileUrl;
            } catch (imgErr) {
                console.error("Profile image upload failed:", imgErr);
                return res.status(400).json({
                    message: imgErr.message || "Could not process profile photo.",
                    success: false
                });
            }
        }

        const existingUser = await User.findOne({
            email: {
                $regex: `^${email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
                $options: "i"
            }
        });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists with this email",
                success: false
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            fullName: fullName.trim(),
            email,
            phoneNumber: phoneValidation.cleanPhone,
            password: hashedPassword,
            role,
            profile: {
                profilePhoto
            }
        });

        return res.status(201).json({
            message: "Account created successfully",
            success: true
        });

    } catch (error) {
        console.error("REGISTER ERROR:", error);
        if (error?.code === 11000 && error?.keyPattern?.email) {
            return res.status(409).json({
                message: "An account already exists with this email address.",
                success: false
            });
        }
        return res.status(500).json({
            message: "Server error",
            success: false
        });
    }
};


// ================= LOGIN =================
export const login = async (req, res) => {
    try {
        if (!process.env.SECRET_KEY) {
            return res.status(503).json({
                message: "Authentication is not configured. Set SECRET_KEY in Backend/.env.",
                success: false
            });
        }

        const { password, role } = req.body;
        const email = req.body.email?.trim().toLowerCase();

        if (!email || !password || !role) {
            return res.status(400).json({
                message: "All fields are required",
                success: false
            });
        }

        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password",
                success: false
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid email or password",
                success: false
            });
        }

        if (role !== user.role) {
            return res.status(400).json({
                message: "Role mismatch",
                success: false
            });
        }

        // JWT Token
        const token = jwt.sign(
            { userId: user._id },
            process.env.SECRET_KEY,
            { expiresIn: "1d" }
        );

        // Safe user object (no password)
        const safeUser = {
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        };

        return res
            .status(200)
            .cookie("token", token, {
                maxAge: 1 * 24 * 60 * 60 * 1000,
                ...getCookieOptions()
            })
            .json({
                message: `Welcome back ${user.fullName}`,
                user: safeUser,
                token,
                success: true
            });

    } catch (error) {
        console.error("LOGIN ERROR:", error);
        return res.status(500).json({
            message: "Server error",
            success: false
        });
    }
};


// ================= LOGOUT =================
export const logout = async (req, res) => {
    try {
        return res
            .status(200)
            .clearCookie("token", getCookieOptions())
            .json({
                message: "Logged out successfully",
                success: true
            });
    } catch (error) {
        console.error("LOGOUT ERROR:", error);
        return res.status(500).json({
            message: "Server error",
            success: false
        });
    }
};

// ================= UPDATE PROFILE =================
export const updateProfile = async (req, res) => {
    try {
        const { fullName, phoneNumber, bio, skills } = req.body;
        const submittedEmail = typeof req.body.email === "string" ? req.body.email.trim() : "";
        const email = submittedEmail ? submittedEmail.toLowerCase() : "";
        const userId = req.id;

        let user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        const currentEmail = typeof user.email === "string" ? user.email.trim().toLowerCase() : "";
        if (email && email !== currentEmail) {
            const existingUser = await User.findOne({
                _id: { $ne: userId },
                email: {
                    $regex: `^${email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
                    $options: "i"
                }
            });
            if (existingUser) {
                return res.status(400).json({
                    message: "That email address is already in use.",
                    success: false
                });
            }
        }

        if (fullName !== undefined) {
            if (typeof fullName !== "string" || !fullName.trim() || fullName.trim().length > 120) {
                return res.status(400).json({ message: "Enter a name between 1 and 120 characters.", success: false });
            }
            user.fullName = fullName.trim();
        }
        if (email && email !== currentEmail) {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                return res.status(400).json({ message: "Enter a valid email address.", success: false });
            }
            user.email = email;
        }
        if (phoneNumber) {
            const phoneValidation = validatePhoneNumber(phoneNumber);
            if (!phoneValidation.isValid) {
                return res.status(400).json({
                    message: phoneValidation.message,
                    success: false
                });
            }
            user.phoneNumber = phoneValidation.cleanPhone;
        }

        if (!user.profile) {
            user.profile = {};
        }

        if (bio !== undefined) user.profile.bio = bio;
        if (skills !== undefined) {
            const parsedSkills = Array.isArray(skills)
                ? skills.map((skill) => String(skill).trim()).filter(Boolean)
                : String(skills).split(",").map((skill) => skill.trim()).filter(Boolean);
            if (parsedSkills.some((skill) => skill.length > 80)) {
                return res.status(400).json({ message: "Each skill must be 80 characters or fewer.", success: false });
            }
            user.profile.skills = [...new Set(parsedSkills)];
            user.markModified("profile.skills");
        }

        const file = req.file;

        if (file) {
            const isImage = file.mimetype?.startsWith("image/") || /\.(png|jpe?g|webp|gif|svg)$/i.test(file.originalname || "");
            const allowedResumeTypes = new Set([
                "application/pdf",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            ]);
            const isDoc = allowedResumeTypes.has(file.mimetype) || /\.(pdf|docx?)$/i.test(file.originalname || "");

            if (!isImage && !isDoc) {
                return res.status(400).json({
                    message: "Uploaded file must be a resume (PDF/DOCX) or profile photo (image).",
                    success: false
                });
            }

            if (isImage) {
                const stored = await storeImageSecurely(file, "profile", "profiles");
                user.profile.profilePhoto = stored.fileUrl;
            } else {
                const stored = await storeFileSecurely(file, "resume", "resumes");
                user.profile.resume = stored.fileUrl;
                user.profile.resumeOriginalName = stored.fileName;
            }
        }

        await user.save();

        const updatedUser = {
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        };

        return res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser,
            success: true
        });

    } catch (error) {
        console.error("UPDATE PROFILE ERROR:", error);

        if (error?.code === 11000 && error?.keyPattern?.email) {
            return res.status(409).json({
                message: "That email address is already in use by another account.",
                success: false
            });
        }
        return res.status(500).json({
            message: "Server error",
            success: false
        });
    }
};

// ================= SAVED JOBS =================
export const saveJob = async (req, res) => {
    try {
        const userId = req.id;
        const { jobId } = req.params;

        // Check user
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Check job
        const job = await Job.findById(jobId);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

        // Already Saved?
        if (user.savedJobs.includes(jobId)) {
            return res.status(400).json({
                success: false,
                message: "Job already saved"
            });
        }

        // Save Job
        user.savedJobs.push(jobId);

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Job saved successfully"
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// =============== GET SAVED JOBS ===============
export const getSavedJobs = async (req, res) => {
    try {
        const user = await User.findById(req.id).populate({
            path: "savedJobs",
            populate: {
                path: "company"
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            savedJobs: user.savedJobs
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};