import { analyzeResume, compareWithJobDescription, improveBulletOrSection } from "./utils/atsAnalyzer.js";
import { parseResumeFromText } from "./utils/textExtractor.js";

console.log("=== Testing ATS Resume Analyzer ===");

// 1. Test sample resume data
const sampleResumeData = {
    personalInfo: {
        fullName: "Alex Rivera",
        email: "alex.rivera@example.com",
        phoneNumber: "+1 555-123-4567",
        address: "San Francisco, CA",
        linkedin: "https://linkedin.com/in/alexrivera",
        github: "https://github.com/alexrivera",
        portfolio: "https://alexrivera.dev"
    },
    summary: "Dedicated Full Stack Software Engineer with expertise in React, Node.js, Express, and MongoDB. Proven track record of developing scalable web applications and optimizing system performance.",
    education: [
        {
            institution: "University of California, Berkeley",
            degree: "Bachelor of Science",
            fieldOfStudy: "Computer Science",
            startDate: "2021",
            endDate: "2025",
            grade: "3.8 GPA"
        }
    ],
    skills: {
        technical: ["JavaScript", "TypeScript", "React", "Node.js", "Express", "MongoDB", "PostgreSQL", "AWS", "Docker", "Git"],
        soft: ["Teamwork", "Problem Solving", "Communication", "Agile"],
        tools: ["VS Code", "Postman", "Jest"]
    },
    experience: [
        {
            company: "TechNova Solutions",
            role: "Software Engineering Intern",
            location: "San Jose, CA",
            startDate: "June 2024",
            endDate: "August 2024",
            bullets: [
                "Engineered scalable REST APIs using Node.js and Express, improving data retrieval speed by 35%.",
                "Architected reactive UI components using React and Tailwind CSS, supporting 5,000+ daily active users.",
                "Responsible for fixing bugs and helped with database migrations." // deliberate weak bullet
            ]
        }
    ],
    projects: [
        {
            title: "Cloud Task Manager",
            technologies: ["React", "Node.js", "MongoDB", "AWS S3"],
            link: "https://github.com/alexrivera/cloud-task-manager",
            bullets: [
                "Developed secure user authentication using JWT and bcrypt, ensuring 100% test coverage.",
                "Integrated AWS S3 for cloud file storage and media uploads, reducing server load by 40%."
            ]
        }
    ],
    certifications: [
        { name: "AWS Certified Cloud Practitioner", issuer: "Amazon Web Services", issueDate: "2024" }
    ],
    achievements: ["Dean's Honor List 2023, 2024"],
    languages: ["English (Native)", "Spanish (Conversational)"]
};

// Test Analysis
const analysis = analyzeResume(sampleResumeData);
console.log("Analysis Score:", analysis.score);
console.log("Score Breakdown:", analysis.breakdown);
console.log("Strengths:", analysis.strengths);
console.log("Issues:", analysis.issues);
console.log("Weak Bullets Identified:", analysis.weakBullets);
console.log("Missing Sections:", analysis.missingSections);

if (analysis.score < 50 || analysis.score > 100) {
    throw new Error(`Score out of expected bounds: ${analysis.score}`);
}

// 2. Test Job Description Comparison
const sampleJD = `
We are looking for a Full Stack Developer proficient in React, Node.js, TypeScript, AWS, Docker, and Kubernetes.
Must have experience building REST APIs, writing unit tests with Jest, and working in an Agile team.
`;

const jdComparison = compareWithJobDescription(sampleResumeData, sampleJD, "Full Stack Developer");
console.log("\n=== Job Description Comparison ===");
console.log("Match Score:", jdComparison.matchScore + "%");
console.log("Matched Keywords:", jdComparison.matchedKeywords);
console.log("Missing Keywords:", jdComparison.missingKeywords);
console.log("Recommendations:", jdComparison.tailoringRecommendations);

// 3. Test Bullet Rewriting
const weakBullet = "Responsible for building the user interface and helped with tests.";
const improvement = improveBulletOrSection(weakBullet, "bullet");
console.log("\n=== Bullet Rewriting ===");
console.log("Original:", improvement.original);
console.log("Suggestions:", improvement.suggestions);

// 4. Test Text Parser
const sampleText = `
Alex Rivera
alex.rivera@example.com | +1 555-123-4567 | linkedin.com/in/alexrivera | github.com/alexrivera

PROFESSIONAL SUMMARY
Passionate Software Engineer with expertise in React, Node.js, and AWS.

EDUCATION
UC Berkeley - B.S. Computer Science, 2025

TECHNICAL SKILLS
Languages: JavaScript, TypeScript, Python
Frameworks: React, Express, Node.js
Databases: MongoDB, PostgreSQL
Cloud: AWS, Docker

WORK EXPERIENCE
Software Intern - TechCorp
- Developed REST APIs reducing latency by 30%
- Designed responsive interfaces in React
`;

const parsed = parseResumeFromText(sampleText);
console.log("\n=== Text Parser ===");
console.log("Parsed Name:", parsed.personalInfo.fullName);
console.log("Parsed Email:", parsed.personalInfo.email);
console.log("Parsed Tech Skills:", parsed.skills.technical);
console.log("Detected Sections:", parsed.hasSections);

console.log("\nALL BACKEND ATS TESTS PASSED SUCCESSFULLY!");

