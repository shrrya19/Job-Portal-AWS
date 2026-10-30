import { Resume } from "../models/resume.model.js";
import { User } from "../models/user.model.js";
import { storeFileSecurely } from "../utils/fileStorage.js";
import { extractTextFromFile, parseResumeFromText } from "../utils/textExtractor.js";
import {
    analyzeResume,
    compareWithJobDescription,
    improveBulletOrSection
} from "../utils/atsAnalyzer.js";

// ================= UPLOAD RESUME =================
export const uploadResume = async (req, res) => {
    try {
        const userId = req.id;
        const file = req.file;

        if (!file) {
            return res.status(400).json({
                message: "Please upload a resume file (PDF or DOCX).",
                success: false
            });
        }

        const allowedMimes = new Set([
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ]);

        const ext = (file.originalname || "").toLowerCase();
        const isPdfOrWord = allowedMimes.has(file.mimetype) ||
            ext.endsWith(".pdf") ||
            ext.endsWith(".docx") ||
            ext.endsWith(".doc");

        if (!isPdfOrWord) {
            return res.status(400).json({
                message: "Invalid file type. Only PDF and DOCX files are allowed.",
                success: false
            });
        }

        // 1. Extract text from uploaded document
        let extractedText = "";
        try {
            extractedText = await extractTextFromFile(file);
        } catch (extractErr) {
            return res.status(422).json({
                message: `Failed to extract text from document: ${extractErr.message}`,
                success: false
            });
        }

        if (!extractedText || extractedText.trim().length < 20) {
            return res.status(422).json({
                message: "Could not read sufficient text from this file. The document may be empty, image-scanned, or password-protected.",
                success: false
            });
        }

        // 2. Store file safely (Cloudinary or local fallback)
        let storageInfo;
        try {
            storageInfo = await storeFileSecurely(file, `resume_${userId}`);
        } catch (storageErr) {
            return res.status(500).json({
                message: `Failed to store file: ${storageErr.message}`,
                success: false
            });
        }

        // 3. Parse initial structured sections from text
        const parsedData = parseResumeFromText(extractedText);

        // 4. Run ATS analysis
        const analysisResult = analyzeResume(extractedText);

        // Determine file type
        let fileType = "pdf";
        if (ext.endsWith(".docx") || ext.endsWith(".doc") || file.mimetype.includes("word")) {
            fileType = "docx";
        }

        // 5. Create Resume Record
        const newResume = await Resume.create({
            userId,
            title: file.originalname ? file.originalname.replace(/\.[^/.]+$/, "") : "Uploaded Resume",
            source: "upload",
            fileUrl: storageInfo.fileUrl,
            fileName: file.originalname,
            fileType,
            fileSize: file.size,
            extractedText,
            resumeData: {
                personalInfo: parsedData.personalInfo,
                summary: parsedData.summary,
                skills: parsedData.skills,
                education: parsedData.educationText ? [{
                    institution: parsedData.educationText.slice(0, 100),
                    degree: "Extracted Degree",
                    fieldOfStudy: "",
                    startDate: "",
                    endDate: "",
                    description: parsedData.educationText
                }] : [],
                experience: parsedData.experienceText ? [{
                    company: "Extracted Experience",
                    role: "Role",
                    description: parsedData.experienceText,
                    bullets: parsedData.experienceText.split("\n").filter(l => l.trim().length > 10)
                }] : [],
                projects: parsedData.projectsText ? [{
                    title: "Extracted Project",
                    description: parsedData.projectsText,
                    bullets: parsedData.projectsText.split("\n").filter(l => l.trim().length > 10)
                }] : [],
                certifications: parsedData.certificationsText ? [{
                    name: parsedData.certificationsText.slice(0, 100)
                }] : [],
                achievements: parsedData.achievementsText ? parsedData.achievementsText.split("\n") : [],
                languages: []
            },
            analysis: {
                score: analysisResult.score,
                breakdown: analysisResult.breakdown,
                strengths: analysisResult.strengths,
                issues: analysisResult.issues,
                suggestions: analysisResult.suggestions,
                detectedKeywords: analysisResult.detectedKeywords,
                missingSections: analysisResult.missingSections,
                weakBullets: analysisResult.weakBullets,
                formattingIssues: analysisResult.formattingIssues,
                lastAnalyzedAt: new Date()
            }
        });

        // Optionally update user's profile resume if not yet set
        try {
            const user = await User.findById(userId);
            if (user && !user.profile?.resume) {
                user.profile = user.profile || {};
                user.profile.resume = storageInfo.fileUrl;
                user.profile.resumeOriginalName = file.originalname;
                await user.save();
            }
        } catch {
            // non-critical user profile sync
        }

        return res.status(201).json({
            message: "Resume uploaded and analyzed successfully.",
            success: true,
            resume: newResume,
            analysis: analysisResult
        });

    } catch (error) {
        console.error("UPLOAD RESUME ERROR:", error);
        return res.status(500).json({
            message: "Server error occurred while uploading resume.",
            success: false
        });
    }
};

// ================= SAVE RESUME DRAFT (BUILDER) =================
export const saveResumeDraft = async (req, res) => {
    try {
        const userId = req.id;
        const { resumeId, title, resumeData } = req.body;

        if (!resumeData) {
            return res.status(400).json({
                message: "Resume data is required.",
                success: false
            });
        }

        // Run ATS Analysis on the builder content
        const analysisResult = analyzeResume(resumeData);

        let resume;

        if (resumeId) {
            // Update existing resume
            resume = await Resume.findById(resumeId);
            if (!resume) {
                return res.status(404).json({
                    message: "Resume not found.",
                    success: false
                });
            }

            // Authorization check
            if (resume.userId.toString() !== userId) {
                return res.status(403).json({
                    message: "You are not authorized to update this resume.",
                    success: false
                });
            }

            if (title) resume.title = title.trim();
            resume.resumeData = resumeData;
            resume.analysis = {
                score: analysisResult.score,
                breakdown: analysisResult.breakdown,
                strengths: analysisResult.strengths,
                issues: analysisResult.issues,
                suggestions: analysisResult.suggestions,
                detectedKeywords: analysisResult.detectedKeywords,
                missingSections: analysisResult.missingSections,
                weakBullets: analysisResult.weakBullets,
                formattingIssues: analysisResult.formattingIssues,
                lastAnalyzedAt: new Date()
            };

            await resume.save();
        } else {
            // Create new resume
            resume = await Resume.create({
                userId,
                title: title?.trim() || "My Resume",
                source: "builder",
                fileType: "builder",
                resumeData,
                analysis: {
                    score: analysisResult.score,
                    breakdown: analysisResult.breakdown,
                    strengths: analysisResult.strengths,
                    issues: analysisResult.issues,
                    suggestions: analysisResult.suggestions,
                    detectedKeywords: analysisResult.detectedKeywords,
                    missingSections: analysisResult.missingSections,
                    weakBullets: analysisResult.weakBullets,
                    formattingIssues: analysisResult.formattingIssues,
                    lastAnalyzedAt: new Date()
                }
            });
        }

        return res.status(200).json({
            message: "Resume saved successfully.",
            success: true,
            resume,
            analysis: analysisResult
        });

    } catch (error) {
        console.error("SAVE RESUME DRAFT ERROR:", error);
        return res.status(500).json({
            message: "Server error occurred while saving resume draft.",
            success: false
        });
    }
};

// ================= GET USER'S RESUMES =================
export const getMyResumes = async (req, res) => {
    try {
        const userId = req.id;

        const resumes = await Resume.find({ userId })
            .sort({ updatedAt: -1 })
            .select("-extractedText"); // exclude large raw text string for list

        return res.status(200).json({
            success: true,
            resumes
        });

    } catch (error) {
        console.error("GET MY RESUMES ERROR:", error);
        return res.status(500).json({
            message: "Server error occurred while retrieving resumes.",
            success: false
        });
    }
};

// ================= GET RESUME BY ID =================
export const getResumeById = async (req, res) => {
    try {
        const userId = req.id;
        const { id } = req.params;

        const resume = await Resume.findById(id);

        if (!resume) {
            return res.status(404).json({
                message: "Resume not found.",
                success: false
            });
        }

        // Ownership authorization check
        if (resume.userId.toString() !== userId) {
            return res.status(403).json({
                message: "You are not authorized to access this resume.",
                success: false
            });
        }

        return res.status(200).json({
            success: true,
            resume
        });

    } catch (error) {
        console.error("GET RESUME BY ID ERROR:", error);
        return res.status(500).json({
            message: "Server error occurred while retrieving resume details.",
            success: false
        });
    }
};

// ================= DELETE RESUME =================
export const deleteResume = async (req, res) => {
    try {
        const userId = req.id;
        const { id } = req.params;

        const resume = await Resume.findById(id);

        if (!resume) {
            return res.status(404).json({
                message: "Resume not found.",
                success: false
            });
        }

        if (resume.userId.toString() !== userId) {
            return res.status(403).json({
                message: "You are not authorized to delete this resume.",
                success: false
            });
        }

        await Resume.findByIdAndDelete(id);

        return res.status(200).json({
            message: "Resume deleted successfully.",
            success: true
        });

    } catch (error) {
        console.error("DELETE RESUME ERROR:", error);
        return res.status(500).json({
            message: "Server error occurred while deleting resume.",
            success: false
        });
    }
};

// ================= ANALYZE RESUME CONTENT =================
export const analyzeResumeContent = async (req, res) => {
    try {
        const userId = req.id;
        const { resumeId, text, resumeData, jobDescription, targetRole } = req.body;

        let contentToAnalyze = text || resumeData;
        let resumeDoc = null;

        if (resumeId) {
            resumeDoc = await Resume.findById(resumeId);
            if (!resumeDoc) {
                return res.status(404).json({
                    message: "Resume not found.",
                    success: false
                });
            }
            if (resumeDoc.userId.toString() !== userId) {
                return res.status(403).json({
                    message: "You are not authorized to access this resume.",
                    success: false
                });
            }

            contentToAnalyze = resumeDoc.resumeData || resumeDoc.extractedText;
        }

        if (!contentToAnalyze) {
            return res.status(400).json({
                message: "Please provide resume content or a valid resume ID for analysis.",
                success: false
            });
        }

        // Run ATS Analysis
        const analysisResult = analyzeResume(contentToAnalyze);

        // Run Job Description comparison if provided
        let jobComparisonResult = null;
        if (jobDescription && jobDescription.trim()) {
            jobComparisonResult = compareWithJobDescription(contentToAnalyze, jobDescription, targetRole);
        }

        // Update resume document if analyzing an existing resume
        if (resumeDoc) {
            resumeDoc.analysis = {
                score: analysisResult.score,
                breakdown: analysisResult.breakdown,
                strengths: analysisResult.strengths,
                issues: analysisResult.issues,
                suggestions: analysisResult.suggestions,
                detectedKeywords: analysisResult.detectedKeywords,
                missingSections: analysisResult.missingSections,
                weakBullets: analysisResult.weakBullets,
                formattingIssues: analysisResult.formattingIssues,
                lastAnalyzedAt: new Date()
            };

            if (jobComparisonResult) {
                resumeDoc.analysis.jobComparison = {
                    targetRole: targetRole || "",
                    jobDescription: jobDescription || "",
                    matchScore: jobComparisonResult.matchScore,
                    matchedKeywords: jobComparisonResult.matchedKeywords,
                    missingKeywords: jobComparisonResult.missingKeywords,
                    matchedSkills: jobComparisonResult.matchedSkills || [],
                    missingSkills: jobComparisonResult.missingSkills || [],
                    tailoringRecommendations: jobComparisonResult.tailoringRecommendations
                };
            }

            await resumeDoc.save();
        }

        return res.status(200).json({
            success: true,
            analysis: analysisResult,
            jobComparison: jobComparisonResult
        });

    } catch (error) {
        console.error("ANALYZE RESUME ERROR:", error);
        return res.status(500).json({
            message: "Server error occurred while analyzing resume.",
            success: false
        });
    }
};

// ================= COMPARE WITH JOB DESCRIPTION =================
export const compareJobDescription = async (req, res) => {
    try {
        const userId = req.id;
        const { resumeId, resumeText, resumeData, jobDescription, targetRole } = req.body;

        if (!jobDescription || !jobDescription.trim()) {
            return res.status(400).json({
                message: "Job description is required.",
                success: false
            });
        }

        let content = resumeText || resumeData;

        if (resumeId) {
            const resume = await Resume.findById(resumeId);
            if (!resume) {
                return res.status(404).json({
                    message: "Resume not found.",
                    success: false
                });
            }
            if (resume.userId.toString() !== userId) {
                return res.status(403).json({
                    message: "Unauthorized.",
                    success: false
                });
            }
            content = resume.resumeData || resume.extractedText;
        }

        if (!content) {
            return res.status(400).json({
                message: "Resume content is required.",
                success: false
            });
        }

        const comparison = compareWithJobDescription(content, jobDescription, targetRole);

        return res.status(200).json({
            success: true,
            comparison
        });

    } catch (error) {
        console.error("COMPARE JOB DESCRIPTION ERROR:", error);
        return res.status(500).json({
            message: "Server error occurred while comparing job description.",
            success: false
        });
    }
};

// ================= IMPROVE BULLET OR TEXT =================
export const improveBullet = async (req, res) => {
    try {
        const { text, type } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({
                message: "Text is required.",
                success: false
            });
        }

        const result = improveBulletOrSection(text, type);

        return res.status(200).json({
            success: true,
            result
        });

    } catch (error) {
        console.error("IMPROVE TEXT ERROR:", error);
        return res.status(500).json({
            message: "Server error occurred while generating improvements.",
            success: false
        });
    }
};

