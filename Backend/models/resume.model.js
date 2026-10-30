import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    title: {
        type: String,
        default: "Untitled Resume",
        trim: true
    },
    source: {
        type: String,
        enum: ["upload", "builder"],
        default: "builder"
    },
    fileUrl: {
        type: String,
        default: ""
    },
    fileName: {
        type: String,
        default: ""
    },
    fileType: {
        type: String,
        enum: ["pdf", "docx", "doc", "builder"],
        default: "builder"
    },
    fileSize: {
        type: Number,
        default: 0
    },
    extractedText: {
        type: String,
        default: ""
    },
    resumeData: {
        personalInfo: {
            fullName: { type: String, default: "" },
            email: { type: String, default: "" },
            phoneNumber: { type: String, default: "" },
            address: { type: String, default: "" },
            linkedin: { type: String, default: "" },
            github: { type: String, default: "" },
            portfolio: { type: String, default: "" }
        },
        summary: {
            type: String,
            default: ""
        },
        education: [
            {
                institution: { type: String, default: "" },
                degree: { type: String, default: "" },
                fieldOfStudy: { type: String, default: "" },
                startDate: { type: String, default: "" },
                endDate: { type: String, default: "" },
                current: { type: Boolean, default: false },
                grade: { type: String, default: "" },
                description: { type: String, default: "" }
            }
        ],
        skills: {
            technical: [{ type: String }],
            soft: [{ type: String }],
            tools: [{ type: String }]
        },
        experience: [
            {
                company: { type: String, default: "" },
                role: { type: String, default: "" },
                location: { type: String, default: "" },
                startDate: { type: String, default: "" },
                endDate: { type: String, default: "" },
                current: { type: Boolean, default: false },
                description: { type: String, default: "" },
                bullets: [{ type: String }]
            }
        ],
        projects: [
            {
                title: { type: String, default: "" },
                technologies: [{ type: String }],
                link: { type: String, default: "" },
                startDate: { type: String, default: "" },
                endDate: { type: String, default: "" },
                description: { type: String, default: "" },
                bullets: [{ type: String }]
            }
        ],
        certifications: [
            {
                name: { type: String, default: "" },
                issuer: { type: String, default: "" },
                issueDate: { type: String, default: "" },
                credentialUrl: { type: String, default: "" }
            }
        ],
        achievements: [{ type: String }],
        languages: [{ type: String }],
        extracurriculars: [{ type: String }]
    },
    analysis: {
        score: { type: Number, default: 0 },
        breakdown: {
            contactScore: { type: Number, default: 0 },
            sectionsScore: { type: Number, default: 0 },
            skillsScore: { type: Number, default: 0 },
            bulletQualityScore: { type: Number, default: 0 },
            formattingScore: { type: Number, default: 0 }
        },
        strengths: [{ type: String }],
        issues: [{ type: String }],
        suggestions: [{ type: String }],
        detectedKeywords: [{ type: String }],
        missingSections: [{ type: String }],
        weakBullets: [
            {
                original: { type: String },
                reason: { type: String },
                suggestion: { type: String }
            }
        ],
        formattingIssues: [{ type: String }],
        jobComparison: {
            targetRole: { type: String, default: "" },
            jobDescription: { type: String, default: "" },
            matchScore: { type: Number, default: 0 },
            matchedKeywords: [{ type: String }],
            missingKeywords: [{ type: String }],
            matchedSkills: [{ type: String }],
            missingSkills: [{ type: String }],
            tailoringRecommendations: [{ type: String }]
        },
        lastAnalyzedAt: {
            type: Date,
            default: Date.now
        }
    }
}, { timestamps: true });

export const Resume = mongoose.model("Resume", resumeSchema);

