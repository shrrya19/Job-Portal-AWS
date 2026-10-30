import { generateJobSpecificQuestions, evaluateInterviewAnswers } from "./utils/interviewEngine.js";

console.log("=== Testing Demo Interview Engine ===");

// 1. Mock Job Data (Java Developer)
const mockJavaJob = {
  title: "Senior Java Backend Engineer",
  description: "We are seeking a Java Engineer to design high-throughput REST APIs, optimize database queries, and build resilient microservices with Spring Boot.",
  requirements: ["Java", "Spring Boot", "SQL", "Microservices", "Docker"],
  company: { name: "Apex FinTech" },
  jobType: "Full-Time",
  position: 2
};

const mockStudentProfile = {
  skills: ["Java", "SQL", "Git", "REST APIs"],
  bio: "Aspiring backend software developer specializing in Java and distributed systems."
};

// Test Question Generation
const questions = generateJobSpecificQuestions(mockJavaJob, mockStudentProfile, "Mixed");
console.log(`Generated ${questions.length} questions for Java job.`);

questions.forEach((q, idx) => {
  console.log(`[Q${idx + 1}] (${q.category}) ${q.question.slice(0, 90)}...`);
  if (!q.expectedKeywords || q.expectedKeywords.length === 0) {
    throw new Error(`Question ${q.id} missing expected keywords.`);
  }
});

if (questions.length < 4) {
  throw new Error("Expected at least 4 questions generated.");
}

// 2. Test Answer Evaluation
// Simulate student answering the questions
const answeredQuestions = questions.map((q, idx) => {
  if (idx === 0) {
    // Strong answer with keywords
    return {
      ...q,
      studentAnswer: "In Java, memory management uses the JVM Heap and Stack. The garbage collector automatically reclaims unreferenced objects across young and old generations using algorithms like G1 GC. In production, I would enable heap dumps on OutOfMemoryError and inspect them with a profiler like Eclipse MAT to identify leaking references."
    };
  } else if (idx === 1) {
    // Moderate answer
    return {
      ...q,
      studentAnswer: "We use asynchronous tasks in Spring Boot using the async annotation and thread pools to avoid blocking the main thread."
    };
  } else {
    // Brief/partial answer
    return {
      ...q,
      studentAnswer: "I would communicate clearly with my team, write unit tests, and follow agile principles."
    };
  }
});

const evalReport = evaluateInterviewAnswers(
  { jobTitle: mockJavaJob.title, requiredSkills: mockJavaJob.requirements, questions: answeredQuestions },
  answeredQuestions
);

console.log("\n=== Evaluation Results ===");
console.log("Overall Score:", evalReport.overallScore + "/100");
console.log("Technical Score:", evalReport.technicalScore + "/100");
console.log("Completeness Score:", evalReport.completenessScore + "/100");
console.log("Strengths:", evalReport.strengths);
console.log("Areas to Improve:", evalReport.improvements);
console.log("Recommended Topics:", evalReport.recommendedTopics);

if (evalReport.overallScore < 30 || evalReport.overallScore > 100) {
  throw new Error(`Unexpected overall score: ${evalReport.overallScore}`);
}

// 3. Test Fallback when job has minimal description
const mockMinimalJob = {
  title: "Junior Web Developer",
  description: "",
  requirements: [],
  company: { name: "Startup" }
};

const fallbackQuestions = generateJobSpecificQuestions(mockMinimalJob, null, "Mixed");
console.log(`\nGenerated ${fallbackQuestions.length} fallback questions for minimal job.`);
if (fallbackQuestions.length < 4) {
  throw new Error("Fallback failed to provide minimum questions.");
}

console.log("\nALL DEMO INTERVIEW TESTS PASSED SUCCESSFULLY!");

