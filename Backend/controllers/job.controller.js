import { Job } from "../models/job.model.js";
import { Company } from "../models/company.model.js";
import { Application } from "../models/application.model.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const jobTypes = ["Full-Time", "Contract", "Internship"];

// Here you see posted jobs by Admin
export const postJob = async (req, res) => {
    try {
        const {
            title,
            description,
            requirements,
            salary,
            location,
            jobType,
            experience,
            position,
            companyId
        } = req.body;

        const userId = req.id;

        // Validation
        const requirementsArray = Array.isArray(requirements)
            ? requirements
            : String(requirements || "").split(",");
        const parsedSalary = Number(salary);
        const parsedExperience = Number(experience);
        const parsedPosition = Number(position);
        const normalizedJobType = typeof jobType === "string" && jobType.trim() === "Full Time"
            ? "Full-Time"
            : typeof jobType === "string"
                ? jobType.trim()
                : jobType;

        if (
            typeof title !== "string" ||
            !title.trim() ||
            typeof description !== "string" ||
            !description.trim() ||
            requirementsArray.every((requirement) => !String(requirement).trim()) ||
            typeof location !== "string" ||
            !location.trim() ||
            !jobTypes.includes(normalizedJobType) ||
            !Number.isFinite(parsedSalary) ||
            parsedSalary < 0 ||
            !Number.isFinite(parsedExperience) ||
            parsedExperience < 0 ||
            !Number.isInteger(parsedPosition) ||
            parsedPosition < 1 ||
            !companyId
        ) {
            return res.status(400).json({
                message: "Provide valid values for every required job field.",
                success: false
            });
        }

        const company = await Company.findOne({ _id: companyId, userId });
        if (!company) {
            return res.status(403).json({
                message: "Select a company that belongs to your account.",
                success: false
            });
        }

        // Create Job
        const job = await Job.create({
            title: title.trim(),
            description: description.trim(),
            requirements: requirementsArray.map((requirement) => String(requirement).trim()).filter(Boolean),
            salary: parsedSalary,
            location: location.trim(),
            jobType: normalizedJobType,
            experienceLevel: parsedExperience,
            position: parsedPosition,
            company: companyId,
            created_by: userId
        });

        return res.status(201).json({
            message: "New job created successfully.",
            job,
            success: true
        });

    } catch (error) {
        console.error("Job creation failed:", error);

        return res.status(500).json({
            message: "Server error",
            success: false
        });
    }
};


// For Students - Get All Jobs
export const getAllJobs = async (req, res) => {
    try {
        const keyword = String(req.query.keyword || "").trim().slice(0, 100);
        const keywordPattern = escapeRegex(keyword);
        const searchConditions = [
            {
                title: {
                    $regex: keywordPattern,
                    $options: "i"
                }
            },
            {
                description: {
                    $regex: keywordPattern,
                    $options: "i"
                }
            },
            {
                requirements: {
                    $regex: keywordPattern,
                    $options: "i"
                }
            }
        ];

        if (keyword) {
            const matchingCompanies = await Company.find({
                name: { $regex: keywordPattern, $options: "i" }
            }).select("_id");
            if (matchingCompanies.length) {
                searchConditions.push({
                    company: { $in: matchingCompanies.map((company) => company._id) }
                });
            }
        }

        const query = { $or: searchConditions };
        const location = String(req.query.location || "").trim().slice(0, 100);
        if (location) {
            query.location = { $regex: escapeRegex(location), $options: "i" };
        }

        const experience = String(req.query.experience || "").trim();
        const experienceMatch = experience.match(/^(?:(\d+)-(\d+)|(\d+)\+)$/);
        if (experienceMatch) {
            query.experienceLevel = experienceMatch[3]
                ? { $gte: Number(experienceMatch[3]) }
                : {
                    $gte: Number(experienceMatch[1]),
                    $lte: Number(experienceMatch[2])
                };
        }

        const jobs = await Job.find(query).populate({
            path: "company"
        }).sort({ createdAt: -1 })

        return res.status(200).json({
            jobs,
            success: true
        });

    } catch (error) {
        console.error("Job search failed:", error);

        return res.status(500).json({
            message: "Server error",
            success: false
        });
    }
};


// For Student - Get Single Job By ID
export const getJobById = async (req, res) => {
    try {
        const jobId = req.params.id;

        const job = await Job.findById(jobId).populate({
            path: "applications"
        });

        if (!job) {
            return res.status(404).json({
                message: "Job not found.",
                success: false
            });
        }

        return res.status(200).json({
            job,
            success: true
        });

    } catch (error) {
        console.error("Job lookup failed:", error);

        return res.status(500).json({
            message: "Server error",
            success: false
        });
    }
};


// How many jobs admin has posted
export const getAdminJobs = async (req, res) => {
    try {
        const adminId = req.id;

        const jobs = await Job.find({
            created_by: adminId
        }).sort({ createdAt: -1 }).populate("company");

        return res.status(200).json({
            jobs,
            success: true
        });

    } catch (error) {
        console.error("Recruiter job lookup failed:", error);

        return res.status(500).json({
            message: "Server error",
            success: false
        });
    }
};

// Recruiter Updates Job
export const updateJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        const userId = req.id;
        const {
            title,
            description,
            requirements,
            salary,
            location,
            jobType,
            experience,
            position,
            companyId
        } = req.body;

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                message: "Job not found.",
                success: false
            });
        }

        if (job.created_by.toString() !== userId) {
            return res.status(403).json({
                message: "You are not authorized to update this job.",
                success: false
            });
        }

        if (title !== undefined) {
            if (typeof title !== "string" || !title.trim()) {
                return res.status(400).json({ message: "Job title is required.", success: false });
            }
            job.title = title.trim();
        }
        if (description !== undefined) {
            if (typeof description !== "string" || !description.trim()) {
                return res.status(400).json({ message: "Job description is required.", success: false });
            }
            job.description = description.trim();
        }
        if (location !== undefined) {
            if (typeof location !== "string" || !location.trim()) {
                return res.status(400).json({ message: "Job location is required.", success: false });
            }
            job.location = location.trim();
        }
        if (jobType !== undefined) {
            const normalizedType = jobType === "Full Time" ? "Full-Time" : jobType;
            if (typeof normalizedType !== "string" || !jobTypes.includes(normalizedType.trim())) {
                return res.status(400).json({ message: "Choose Full-Time, Contract, or Internship.", success: false });
            }
            job.jobType = normalizedType.trim();
        }
        if (salary !== undefined) {
            const parsedSalary = Number(salary);
            if (!Number.isFinite(parsedSalary) || parsedSalary < 0) {
                return res.status(400).json({ message: "Salary must be a non-negative number.", success: false });
            }
            job.salary = parsedSalary;
        }
        if (experience !== undefined) {
            const parsedExperience = Number(experience);
            if (!Number.isFinite(parsedExperience) || parsedExperience < 0) {
                return res.status(400).json({ message: "Experience must be a non-negative number.", success: false });
            }
            job.experienceLevel = parsedExperience;
        }
        if (position !== undefined) {
            const parsedPosition = Number(position);
            if (!Number.isInteger(parsedPosition) || parsedPosition < 1) {
                return res.status(400).json({ message: "Number of positions must be at least one.", success: false });
            }
            job.position = parsedPosition;
        }

        if (companyId) {
            const company = await Company.findOne({ _id: companyId, userId });
            if (!company) {
                return res.status(403).json({
                    message: "Select a valid company belonging to your account.",
                    success: false
                });
            }
            job.company = companyId;
        }

        if (requirements !== undefined) {
            const reqArray = Array.isArray(requirements)
                ? requirements
                : String(requirements).split(",");
            const cleaned = reqArray.map((r) => String(r).trim()).filter(Boolean);
            if (cleaned.length === 0) {
                return res.status(400).json({ message: "Add at least one job requirement.", success: false });
            }
            job.requirements = cleaned;
        }

        await job.save();

        const updatedJob = await Job.findById(jobId).populate("company");

        return res.status(200).json({
            message: "Job updated successfully.",
            job: updatedJob,
            success: true
        });

    } catch (error) {
        console.error("Job update failed:", error);
        return res.status(500).json({
            message: "Failed to update job.",
            success: false
        });
    }
};

// Recruiter Deletes Job
export const deleteJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        const userId = req.id;

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                message: "Job not found.",
                success: false
            });
        }

        if (job.created_by.toString() !== userId) {
            return res.status(403).json({
                message: "You are not authorized to delete this job.",
                success: false
            });
        }

        // Delete associated applications
        await Application.deleteMany({ job: jobId });

        // Delete the job
        await Job.findByIdAndDelete(jobId);

        return res.status(200).json({
            message: "Job and its applications deleted successfully.",
            jobId,
            success: true
        });

    } catch (error) {
        console.error("Job deletion failed:", error);
        return res.status(500).json({
            message: "Failed to delete job.",
            success: false
        });
    }
};