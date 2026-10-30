/**
 * ATS Resume Analyzer Engine
 * Comprehensive heuristic evaluation of resumes against Applicant Tracking System standards.
 */

// Strong action verbs categorized
const ACTION_VERBS = new Set([
    "accelerated", "accomplished", "achieved", "acquired", "adapted", "administered",
    "advanced", "advised", "allocated", "analyzed", "architected", "assembled",
    "assessed", "audited", "automated", "authored", "boosted", "built", "calculated",
    "championed", "collaborated", "compiled", "composed", "conceived", "conducted",
    "configured", "constructed", "consulted", "contributed", "coordinated", "crafted",
    "created", "customized", "debugged", "decreased", "defined", "delivered",
    "demonstrated", "deployed", "designed", "developed", "devised", "diagnosed",
    "directed", "discovered", "documented", "drafted", "drove", "earned", "eliminated",
    "empowered", "enabled", "engineered", "enhanced", "established", "evaluated",
    "executed", "expanded", "expedited", "facilitated", "fine-tuned", "forecasted",
    "formulated", "fostered", "founded", "generated", "guided", "halted", "headed",
    "identified", "implemented", "improved", "increased", "initiated", "innovated",
    "inspected", "installed", "instituted", "integrated", "interviewed", "introduced",
    "invented", "investigated", "launched", "lead", "led", "leveraged", "managed",
    "maximized", "measured", "mentored", "migrated", "minimized", "modeled",
    "modernized", "monitored", "negotiated", "operated", "optimized", "orchestrated",
    "organized", "originated", "overhauled", "oversaw", "partnered", "performed",
    "pioneered", "planned", "prepared", "presented", "produced", "programmed",
    "projected", "promoted", "proposed", "published", "re-engineered", "reached",
    "realigned", "rebuilt", "received", "reconciled", "redesigned", "reduced",
    "refined", "refactored", "remodeled", "reorganized", "repaired", "replaced",
    "resolved", "restructured", "revamped", "reviewed", "revitalized", "saved",
    "scaled", "scheduled", "screened", "secured", "selected", "simplified",
    "solved", "spearheaded", "standardized", "streamlined", "strengthened", "structured",
    "succeeded", "supervised", "surpassed", "synthesized", "systematized", "targeted",
    "tested", "tracked", "trained", "transformed", "translated", "troubleshot",
    "unified", "upgraded", "utilized", "validated", "verified", "won"
]);

// Weak or passive phrases to flag
const WEAK_PHRASES = [
    { pattern: /\b(?:responsible for|duties included|tasks involved)\b/i, label: "Passive phrasing 'Responsible for'" },
    { pattern: /\b(?:worked on|worked with|helped with|assisted in|participated in)\b/i, label: "Vague phrasing 'Worked on / Helped with'" },
    { pattern: /\b(?:handled|did|made)\b/i, label: "Low-impact verb" },
    { pattern: /\b(?:hardworking|go-getter|detail-oriented|team player|think outside the box)\b/i, label: "Cliché buzzword without evidence" }
];

// In-demand technical keywords
const TECH_KEYWORDS_DICTIONARY = [
    // Languages
    "python", "javascript", "typescript", "java", "c++", "c#", "go", "golang", "ruby", "rust", "php", "swift", "kotlin", "sql", "nosql", "bash", "html5", "css3",
    // Frontend
    "react", "react.js", "next.js", "redux", "vue.js", "angular", "tailwind css", "bootstrap", "sass", "webpack", "vite", "responsive design", "web performance",
    // Backend & API
    "node.js", "express.js", "express", "django", "fastapi", "flask", "spring boot", "rest api", "graphql", "microservices", "grpc", "jwt", "oauth",
    // Databases
    "mongodb", "postgresql", "mysql", "redis", "dynamodb", "sqlite", "prisma", "mongoose", "firebase",
    // Cloud & DevOps
    "aws", "amazon web services", "s3", "ec2", "lambda", "ecs", "cloudformation", "azure", "google cloud", "gcp", "docker", "kubernetes", "ci/cd", "github actions", "jenkins", "terraform", "linux", "nginx",
    // Architecture & Concepts
    "data structures", "algorithms", "system design", "object-oriented programming", "oop", "mvc", "unit testing", "jest", "cypress", "agile", "scrum", "git", "github", "debugging", "api integration"
];

// Soft skills dictionary
const SOFT_SKILLS_DICTIONARY = [
    "leadership", "communication", "team collaboration", "problem solving", "critical thinking",
    "adaptability", "time management", "conflict resolution", "cross-functional teamwork",
    "project management", "presentation", "mentoring"
];

/**
 * Evaluates any resume (extracted text or structured builder data) and produces an ATS compatibility report.
 */
export const analyzeResume = (input) => {
    let text = "";
    let personalInfo = {};
    let experienceList = [];
    let projectList = [];
    let educationList = [];
    let skillsObj = { technical: [], soft: [], tools: [] };
    let summaryText = "";

    // Support both raw string or structured resumeData object
    if (typeof input === "string") {
        text = input;
        summaryText = text;
    } else if (input && typeof input === "object") {
        personalInfo = input.personalInfo || {};
        summaryText = input.summary || "";
        experienceList = Array.isArray(input.experience) ? input.experience : [];
        projectList = Array.isArray(input.projects) ? input.projects : [];
        educationList = Array.isArray(input.education) ? input.education : [];
        skillsObj = input.skills || { technical: [], soft: [], tools: [] };

        // Construct aggregated text for full-text checks
        const expBullets = experienceList.flatMap(e => e.bullets || [e.description || ""]);
        const projBullets = projectList.flatMap(p => p.bullets || [p.description || ""]);
        const allSkills = [
            ...(skillsObj.technical || []),
            ...(skillsObj.soft || []),
            ...(skillsObj.tools || [])
        ];

        text = [
            personalInfo.fullName,
            personalInfo.email,
            personalInfo.phoneNumber,
            personalInfo.linkedin,
            personalInfo.github,
            summaryText,
            educationList.map(e => `${e.degree || ""} ${e.fieldOfStudy || ""} ${e.institution || ""} ${e.description || ""}`).join(" "),
            allSkills.join(" "),
            experienceList.map(e => `${e.role || ""} ${e.company || ""} ${e.description || ""}`).join(" "),
            expBullets.join(" "),
            projectList.map(p => `${p.title || ""} ${(p.technologies || []).join(" ")} ${p.description || ""}`).join(" "),
            projBullets.join(" "),
            (input.certifications || []).map(c => c.name || "").join(" "),
            (input.achievements || []).join(" ")
        ].filter(Boolean).join("\n");
    }

    const lowerText = text.toLowerCase();
    const words = text.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    // ============================================
    // 1. CONTACT INFORMATION SCORE (Max: 15)
    // ============================================
    let contactScore = 0;
    const missingContact = [];

    const hasEmail = Boolean(personalInfo.email || text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/));
    const hasPhone = Boolean(personalInfo.phoneNumber || text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b\d{10}\b/));
    const hasName = Boolean(personalInfo.fullName || (words.length > 2 && /^[A-Z][a-z]+ [A-Z][a-z]+/.test(words.slice(0, 4).join(" "))));
    const hasLinkedIn = Boolean(personalInfo.linkedin || text.match(/linkedin\.com/i));
    const hasGithub = Boolean(personalInfo.github || text.match(/github\.com/i) || personalInfo.portfolio);

    if (hasName) contactScore += 3; else missingContact.push("Full Name");
    if (hasEmail) contactScore += 4; else missingContact.push("Professional Email");
    if (hasPhone) contactScore += 3; else missingContact.push("Phone Number");
    if (hasLinkedIn) contactScore += 3; else missingContact.push("LinkedIn Profile URL");
    if (hasGithub) contactScore += 2; else missingContact.push("GitHub or Portfolio Link");

    // ============================================
    // 2. ESSENTIAL ATS SECTIONS SCORE (Max: 25)
    // ============================================
    let sectionsScore = 0;
    const missingSections = [];
    const detectedSections = [];

    const checkSection = (name, hasContent, pts, tip) => {
        if (hasContent) {
            sectionsScore += pts;
            detectedSections.push(name);
        } else {
            missingSections.push(name);
        }
    };

    const hasSummary = Boolean(summaryText.trim().length > 30 || /summary|career objective|about me/i.test(text));
    const hasEducation = Boolean(educationList.length > 0 || /education|degree|bachelor|master|b\.tech|b\.e|university|college|gpa/i.test(text));
    const hasSkills = Boolean(
        (skillsObj.technical?.length > 0) ||
        /technical skills|skills|technologies|proficiencies|languages & frameworks/i.test(text)
    );
    const hasExperience = Boolean(
        experienceList.length > 0 ||
        /experience|employment|internship|intern|work history/i.test(text)
    );
    const hasProjects = Boolean(
        projectList.length > 0 ||
        /projects|personal projects|academic projects/i.test(text)
    );

    checkSection("Professional Summary", hasSummary, 5, "Add a 2-3 sentence career summary highlighting your core tech strengths.");
    checkSection("Education", hasEducation, 5, "Include your degree, institution name, and graduation year.");
    checkSection("Technical Skills", hasSkills, 5, "List categorized technical proficiencies (Languages, Frameworks, Tools).");
    checkSection("Experience / Internships", hasExperience, 5, "Highlight relevant work or internship experience.");
    checkSection("Projects", hasProjects, 5, "Showcase 2-3 impactful technical projects with live links or GitHub.");

    // ============================================
    // 3. ACTION VERBS & BULLET QUALITY (Max: 25)
    // ============================================
    let bulletQualityScore = 0;
    const weakBullets = [];
    const strongBulletsFound = [];

    // Extract all candidate bullet points
    let allBullets = [];
    if (experienceList.length > 0 || projectList.length > 0) {
        experienceList.forEach(exp => {
            if (Array.isArray(exp.bullets)) allBullets.push(...exp.bullets);
            else if (exp.description) allBullets.push(...exp.description.split("\n"));
        });
        projectList.forEach(proj => {
            if (Array.isArray(proj.bullets)) allBullets.push(...proj.bullets);
            else if (proj.description) allBullets.push(...proj.description.split("\n"));
        });
    } else {
        // From raw text: lines starting with bullet symbols or dashes
        const rawLines = text.split("\n").map(l => l.trim());
        allBullets = rawLines.filter(line => /^[\u2022\u25E6\u2023\u25AA\-\*]\s*.{10,}/.test(line) || /^[A-Z][a-z]+ed\b/.test(line));
    }

    allBullets = allBullets.map(b => b.replace(/^[\u2022\u25E6\u2023\u25AA\-\*]\s*/, "").trim()).filter(b => b.length > 10);

    let actionVerbCount = 0;
    let metricCount = 0;

    allBullets.forEach(bullet => {
        const bulletWords = bullet.toLowerCase().split(/\s+/);
        const firstWord = bulletWords[0]?.replace(/[^a-z]/g, "");

        const hasActionVerb = ACTION_VERBS.has(firstWord);
        const hasMetric = /\b\d+(?:%|\+|x|k|ms|s|gb|mb)?\b|\$\d+/i.test(bullet) || /reduced|increased|improved|boosted|scaled/i.test(bullet);

        if (hasActionVerb) {
            actionVerbCount++;
            strongBulletsFound.push(bullet);
        }

        if (hasMetric) {
            metricCount++;
        }

        // Check for weak phrases
        let weakReason = "";
        for (const wp of WEAK_PHRASES) {
            if (wp.pattern.test(bullet)) {
                weakReason = wp.label;
                break;
            }
        }

        if (!hasActionVerb && !weakReason) {
            weakReason = "Lacks an active impact verb at the start";
        }

        if (weakReason || !hasMetric) {
            if (weakBullets.length < 5) {
                // Generate a constructive rewrite suggestion based on their actual bullet
                let suggestedAction = "Engineered";
                if (/design|ui|ux|frontend/i.test(bullet)) suggestedAction = "Designed and developed";
                else if (/test|qa|bug/i.test(bullet)) suggestedAction = "Implemented automated testing for";
                else if (/database|data|sql|mongo/i.test(bullet)) suggestedAction = "Architected and optimized";
                else if (/api|backend|server/i.test(bullet)) suggestedAction = "Developed robust REST APIs for";

                const cleanCore = bullet.replace(/^(?:responsible for|worked on|helped with|i was|tasked with)\s*/i, "");
                const suggestedText = `${suggestedAction} ${cleanCore.charAt(0).toLowerCase() + cleanCore.slice(1)}, improving efficiency by 25%.`;

                weakBullets.push({
                    original: bullet,
                    reason: weakReason || "Add measurable impact/numbers to strengthen this achievement",
                    suggestion: suggestedText
                });
            }
        }
    });

    if (allBullets.length > 0) {
        const verbRatio = actionVerbCount / allBullets.length;
        const metricRatio = metricCount / allBullets.length;

        // Up to 15 points for action verbs
        bulletQualityScore += Math.min(15, Math.round(verbRatio * 18));
        // Up to 10 points for measurable metrics
        bulletQualityScore += Math.min(10, Math.round(metricRatio * 14));
    } else {
        // Fallback for short resume drafts
        bulletQualityScore = 10;
    }

    // ============================================
    // 4. KEYWORDS & SKILLS RICHNESS (Max: 20)
    // ============================================
    let skillsScore = 0;
    const detectedKeywords = [];
    const detectedSoftSkills = [];

    TECH_KEYWORDS_DICTIONARY.forEach(kw => {
        const reg = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
        if (reg.test(lowerText)) {
            detectedKeywords.push(kw);
        }
    });

    SOFT_SKILLS_DICTIONARY.forEach(sk => {
        const reg = new RegExp(`\\b${sk.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
        if (reg.test(lowerText)) {
            detectedSoftSkills.push(sk);
        }
    });

    // Score based on tech keyword density
    if (detectedKeywords.length >= 10) skillsScore += 15;
    else if (detectedKeywords.length >= 6) skillsScore += 11;
    else if (detectedKeywords.length >= 3) skillsScore += 7;
    else skillsScore += 3;

    // Score based on soft skills balance
    if (detectedSoftSkills.length >= 3) skillsScore += 5;
    else if (detectedSoftSkills.length >= 1) skillsScore += 3;

    // ============================================
    // 5. FORMATTING & ATS COMPATIBILITY (Max: 15)
    // ============================================
    let formattingScore = 15;
    const formattingIssues = [];

    // Word count check
    if (wordCount < 150) {
        formattingScore -= 6;
        formattingIssues.push("Resume is too brief (< 150 words). Most ATS parsers expect 350–800 words.");
    } else if (wordCount > 1200) {
        formattingScore -= 4;
        formattingIssues.push("Resume exceeds 1,200 words. Keep it within 1–2 pages for entry/mid-level roles.");
    }

    // Check for weird symbols or characters that corrupt text extraction
    if (/[\uFFFD\u0000-\u0008\u000E-\u001F]/.test(text)) {
        formattingScore -= 3;
        formattingIssues.push("Detected non-standard unicode characters or encoding artifacts.");
    }

    // Check for multi-column / tabular clutter markers
    if (text.includes("||") || text.includes("+---+") || /\|\s+\|/.test(text)) {
        formattingScore -= 3;
        formattingIssues.push("Detected complex ASCII tables or borders that can confuse ATS parsers.");
    }

    formattingScore = Math.max(0, formattingScore);

    // ============================================
    // TOTAL SCORE CALCULATION
    // ============================================
    const totalScore = Math.min(
        100,
        Math.max(0, contactScore + sectionsScore + bulletQualityScore + skillsScore + formattingScore)
    );

    // ============================================
    // STRENGTHS, ISSUES & ACTIONABLE SUGGESTIONS
    // ============================================
    const strengths = [];
    const issues = [];
    const suggestions = [];

    // Strengths
    if (detectedKeywords.length >= 8) {
        strengths.push(`Rich technical vocabulary: ${detectedKeywords.length} industry-standard keywords detected.`);
    }
    if (hasLinkedIn && hasGithub) {
        strengths.push("Excellent contact visibility with both LinkedIn and GitHub/portfolio profiles.");
    }
    if (actionVerbCount >= 4) {
        strengths.push(`Strong proactive tone: used ${actionVerbCount} high-impact action verbs in descriptions.`);
    }
    if (metricCount >= 2) {
        strengths.push("Good inclusion of measurable metrics and quantitative achievements.");
    }
    if (missingSections.length === 0) {
        strengths.push("Well-structured document containing all essential ATS sections.");
    }

    // Issues
    if (missingSections.length > 0) {
        issues.push(`Missing core sections: ${missingSections.join(", ")}.`);
    }
    if (missingContact.length > 0) {
        issues.push(`Missing contact details: ${missingContact.join(", ")}.`);
    }
    if (weakBullets.length > 0) {
        issues.push(`${weakBullets.length} bullet points lack strong action verbs or measurable impact.`);
    }
    if (detectedKeywords.length < 5) {
        issues.push("Low keyword frequency: add specific tools, frameworks, and programming languages.");
    }
    if (formattingIssues.length > 0) {
        issues.push(...formattingIssues);
    }

    // Specific actionable recommendations
    if (missingSections.includes("Professional Summary")) {
        suggestions.push("Add a 2–3 sentence professional summary summarizing your career focus, top tech stack, and goals.");
    }
    if (missingSections.includes("Projects")) {
        suggestions.push("Create a Projects section detailing 2–3 projects with live demos or GitHub repository links.");
    }
    if (!hasLinkedIn) {
        suggestions.push("Add your customized LinkedIn profile URL to the header for recruiter verification.");
    }
    if (weakBullets.length > 0) {
        suggestions.push("Rewrite passive bullets using the formula: [Action Verb] + [Task/Technology] + [Measurable Result/Impact].");
    }
    if (detectedSoftSkills.length < 2) {
        suggestions.push("Incorporate soft skills naturally into experience bullets (e.g., 'collaborated in agile sprints', 'cross-functional leadership').");
    }
    if (suggestions.length === 0) {
        suggestions.push("Tailor your keywords to specific target job descriptions to further boost your applicant ranking.");
    }

    return {
        score: totalScore,
        breakdown: {
            contactScore,
            sectionsScore,
            bulletQualityScore,
            skillsScore,
            formattingScore
        },
        strengths,
        issues,
        suggestions,
        detectedKeywords,
        detectedSoftSkills,
        missingSections,
        detectedSections,
        missingContact,
        weakBullets,
        formattingIssues,
        wordCount,
        disclaimer: "Disclaimer: This ATS compatibility score is an estimated indicator based on common applicant tracking system parsing heuristics. It is not an official score from an ATS vendor (like Workday, Taleo, or Greenhouse) and does not guarantee job selection."
    };
};

/**
 * Compares resume text with a target Job Description to highlight matching and missing skills.
 */
export const compareWithJobDescription = (resumeContent, jobDescription, targetRole = "") => {
    if (!jobDescription || typeof jobDescription !== "string" || !jobDescription.trim()) {
        return {
            matchScore: 0,
            matchedKeywords: [],
            missingKeywords: [],
            matchedSkills: [],
            missingSkills: [],
            tailoringRecommendations: ["Please provide a Job Description to generate role-specific tailoring suggestions."]
        };
    }

    const jdLower = jobDescription.toLowerCase();
    const resumeText = typeof resumeContent === "string"
        ? resumeContent
        : JSON.stringify(resumeContent);
    const resumeLower = resumeText.toLowerCase();

    // Extract tech skills mentioned in JD
    const jdKeywords = [];
    TECH_KEYWORDS_DICTIONARY.forEach(kw => {
        const regex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
        if (regex.test(jdLower)) {
            jdKeywords.push(kw);
        }
    });

    // Also look for prominent domain words in JD
    const jdWords = jdLower.match(/[a-z]{3,}/g) || [];
    const wordFreq = {};
    const stopWords = new Set([
        "the", "and", "for", "with", "that", "this", "you", "will", "are", "our",
        "have", "from", "your", "work", "role", "team", "join", "years", "experience",
        "required", "preferred", "must", "skills", "ability", "responsibilities"
    ]);

    jdWords.forEach(w => {
        if (!stopWords.has(w) && w.length > 3) {
            wordFreq[w] = (wordFreq[w] || 0) + 1;
        }
    });

    const topJdTerms = Object.entries(wordFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15)
        .map(([w]) => w);

    const matchedKeywords = [];
    const missingKeywords = [];

    // Check JD tech keywords
    jdKeywords.forEach(kw => {
        const regex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
        if (regex.test(resumeLower)) {
            matchedKeywords.push(kw);
        } else {
            missingKeywords.push(kw);
        }
    });

    // Calculate match score
    const totalJdKeywords = jdKeywords.length || 1;
    const matchScore = Math.min(100, Math.round((matchedKeywords.length / totalJdKeywords) * 100));

    // Tailoring recommendations
    const recommendations = [];

    if (missingKeywords.length > 0) {
        recommendations.push(
            `The job posting emphasizes: ${missingKeywords.slice(0, 5).join(", ")}. If you have experience with these, incorporate them into your skills and project bullets.`
        );
    }

    if (targetRole && !resumeLower.includes(targetRole.toLowerCase())) {
        recommendations.push(
            `Align your professional summary and headline with the target title "${targetRole}" to immediately catch the recruiter's eye.`
        );
    }

    if (matchedKeywords.length > 0) {
        recommendations.push(
            `Strong alignment on: ${matchedKeywords.slice(0, 4).join(", ")}. Ensure these are placed prominently near the top of your resume.`
        );
    }

    recommendations.push(
        "Use exact keyword phrasing from the job description when describing relevant projects and responsibilities."
    );

    return {
        matchScore,
        targetRole,
        matchedKeywords,
        missingKeywords,
        topJdTerms,
        tailoringRecommendations: recommendations
    };
};

/**
 * Generates ATS-optimized suggestions for a specific section or bullet point.
 */
export const improveBulletOrSection = (text, type = "bullet") => {
    if (!text || !text.trim()) {
        return {
            original: text,
            suggestions: []
        };
    }

    const trimmed = text.trim();

    if (type === "summary") {
        return {
            original: trimmed,
            suggestions: [
                `Results-driven software engineer with strong foundations in ${trimmed}. Proven ability to build performant web applications, collaborate in agile teams, and solve complex technical challenges.`,
                `Passionate computer science student specializing in full-stack development with hands-on experience in ${trimmed}. Eager to leverage technical problem-solving skills to contribute to high-impact engineering projects.`,
                `Detail-oriented developer proficient in modern frameworks and scalable backend architecture. Experienced in ${trimmed}, seeking to deliver robust, user-centric software solutions.`
            ]
        };
    }

    // Default: Bullet point improvement
    const cleaned = trimmed.replace(/^(?:responsible for|worked on|helped with|assisted in|tasks included)\s*/i, "");
    const baseAction = ACTION_VERBS.has(cleaned.split(" ")[0]?.toLowerCase())
        ? cleaned
        : `Developed and deployed ${cleaned.charAt(0).toLowerCase() + cleaned.slice(1)}`;

    return {
        original: trimmed,
        suggestions: [
            `${baseAction}, optimizing system performance by 25% and improving code maintainability.`,
            `Engineered ${cleaned.charAt(0).toLowerCase() + cleaned.slice(1)} utilizing best design patterns, supporting 1,000+ active users.`,
            `Spearheaded the implementation of ${cleaned.charAt(0).toLowerCase() + cleaned.slice(1)}, reducing deployment turnaround time by 30%.`
        ]
    };
};

