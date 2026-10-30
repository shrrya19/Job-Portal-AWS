import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

/**
 * Extracts readable raw text from a PDF or DOCX file buffer.
 */
export const extractTextFromFile = async (file) => {
    if (!file || !file.buffer) {
        throw new Error("No file buffer provided for text extraction.");
    }

    const mimeType = file.mimetype || "";
    const originalName = (file.originalname || "").toLowerCase();

    let rawText = "";

    if (mimeType.includes("pdf") || originalName.endsWith(".pdf")) {
        let parser;
        try {
            parser = new PDFParse({ data: file.buffer });
            await parser.load();
            const result = await parser.getText();
            rawText = result?.text || "";
        } catch (pdfError) {
            console.error("PDF parsing error:", pdfError.message);
            throw new Error(`Failed to extract text from PDF: ${pdfError.message}`);
        } finally {
            if (parser && typeof parser.destroy === "function") {
                try {
                    await parser.destroy();
                } catch {
                    // ignore cleanup errors
                }
            }
        }
    } else if (
        mimeType.includes("word") ||
        mimeType.includes("officedocument") ||
        originalName.endsWith(".docx") ||
        originalName.endsWith(".doc")
    ) {
        try {
            const mammothResult = await mammoth.extractRawText({ buffer: file.buffer });
            rawText = mammothResult?.value || "";
        } catch (docxError) {
            console.error("DOCX parsing error:", docxError.message);
            throw new Error(`Failed to extract text from Word document: ${docxError.message}`);
        }
    } else if (mimeType.startsWith("text/") || originalName.endsWith(".txt")) {
        rawText = file.buffer.toString("utf-8");
    } else {
        throw new Error("Unsupported file format. Please upload a PDF or DOCX file.");
    }

    // Clean text: strip non-printable characters, trim lines
    const cleanedText = rawText
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .replace(/[ \t]+/g, " ")
        .trim();

    return cleanedText;
};

/**
 * Parses structured resume sections and contact information from extracted text.
 */
export const parseResumeFromText = (text) => {
    if (!text || typeof text !== "string") {
        return {
            personalInfo: {},
            summary: "",
            skills: { technical: [], soft: [], tools: [] },
            experience: [],
            education: [],
            projects: [],
            certifications: [],
            achievements: [],
            languages: []
        };
    }

    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

    // 1. Contact Extraction
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b\d{10}\b/);
    const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in|profile)\/[a-zA-Z0-9_-]+/i);
    const githubMatch = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+/i);

    // First non-empty line that doesn't look like an email or phone is usually the name
    let detectedName = "";
    for (const line of lines.slice(0, 5)) {
        if (!line.includes("@") && !/\d{5,}/.test(line) && line.length < 50 && !/resume|curriculum vitae|cv/i.test(line)) {
            detectedName = line;
            break;
        }
    }

    // 2. Identify Section Boundaries
    const sectionKeywords = [
        { key: "summary", regex: /^(?:professional\s+summary|executive\s+summary|career\s+objective|summary|profile|about\s+me)\b/i },
        { key: "experience", regex: /^(?:work\s+experience|professional\s+experience|experience|employment\s+history|internships?)\b/i },
        { key: "education", regex: /^(?:education|academic\s+qualifications|academic\s+background|qualifications)\b/i },
        { key: "skills", regex: /^(?:technical\s+skills|skills\s*(?:&|and)\s*abilities|skills|core\s+competencies|technologies)\b/i },
        { key: "projects", regex: /^(?:projects|academic\s+projects|personal\s+projects|key\s+projects)\b/i },
        { key: "certifications", regex: /^(?:certifications?|licenses?|credentials?|certificates?)\b/i },
        { key: "achievements", regex: /^(?:achievements?|awards?|honors?|accomplishments?)\b/i },
        { key: "languages", regex: /^(?:languages?|languages?\s+known)\b/i }
    ];

    const detectedSections = {};
    let currentSection = null;

    for (const line of lines) {
        let isSectionHeader = false;
        const cleanLine = line.replace(/[:#\-_]/g, "").trim();

        if (cleanLine.length < 35) {
            for (const { key, regex } of sectionKeywords) {
                if (regex.test(cleanLine)) {
                    currentSection = key;
                    if (!detectedSections[currentSection]) {
                        detectedSections[currentSection] = [];
                    }
                    isSectionHeader = true;
                    break;
                }
            }
        }

        if (!isSectionHeader && currentSection) {
            detectedSections[currentSection].push(line);
        }
    }

    // 3. Extract skills by vocabulary check
    const techSkillSet = new Set([
        "javascript", "typescript", "python", "java", "c++", "c#", "go", "ruby", "rust", "php", "sql", "html", "css",
        "react", "react.js", "next.js", "vue", "angular", "node.js", "express", "express.js", "django", "flask", "fastapi",
        "spring boot", "mongodb", "postgresql", "mysql", "redis", "dynamodb", "aws", "s3", "ec2", "lambda", "docker",
        "kubernetes", "git", "github", "ci/cd", "graphql", "rest api", "tailwind css", "bootstrap", "linux", "redux"
    ]);

    const softSkillSet = new Set([
        "communication", "leadership", "teamwork", "problem solving", "critical thinking",
        "adaptability", "time management", "collaboration", "work ethic", "creativity"
    ]);

    const lowerText = text.toLowerCase();
    const foundTechSkills = [];
    const foundSoftSkills = [];

    techSkillSet.forEach(skill => {
        const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
        if (regex.test(lowerText)) {
            foundTechSkills.push(skill);
        }
    });

    softSkillSet.forEach(skill => {
        const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
        if (regex.test(lowerText)) {
            foundSoftSkills.push(skill);
        }
    });

    return {
        personalInfo: {
            fullName: detectedName,
            email: emailMatch ? emailMatch[0] : "",
            phoneNumber: phoneMatch ? phoneMatch[0] : "",
            linkedin: linkedinMatch ? linkedinMatch[0] : "",
            github: githubMatch ? githubMatch[0] : "",
            address: "",
            portfolio: ""
        },
        summary: detectedSections.summary ? detectedSections.summary.join(" ") : "",
        skills: {
            technical: foundTechSkills,
            soft: foundSoftSkills,
            tools: []
        },
        experienceText: detectedSections.experience ? detectedSections.experience.join("\n") : "",
        educationText: detectedSections.education ? detectedSections.education.join("\n") : "",
        projectsText: detectedSections.projects ? detectedSections.projects.join("\n") : "",
        certificationsText: detectedSections.certifications ? detectedSections.certifications.join("\n") : "",
        achievementsText: detectedSections.achievements ? detectedSections.achievements.join("\n") : "",
        hasSections: {
            contact: !!(emailMatch || phoneMatch),
            summary: !!detectedSections.summary?.length,
            experience: !!detectedSections.experience?.length,
            education: !!detectedSections.education?.length,
            skills: !!(detectedSections.skills?.length || foundTechSkills.length > 0),
            projects: !!detectedSections.projects?.length,
            certifications: !!detectedSections.certifications?.length
        }
    };
};

