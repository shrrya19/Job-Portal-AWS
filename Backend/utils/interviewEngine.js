import { randomUUID } from "crypto";

// Technology-specific question knowledge base
const TECH_QUESTION_BANK = {
  java: [
    {
      q: "Explain how memory management and Garbage Collection work in Java. How would you diagnose an OutOfMemoryError in a production Spring Boot service?",
      keywords: ["jvm", "heap", "stack", "garbage collection", "memory leak", "heap dump", "profiler", "young generation", "old generation"],
      concepts: ["JVM Architecture", "Memory allocation", "GC algorithms (G1, ZGC)", "Heap dump analysis"],
      model: "In Java, memory is divided into the Heap (for objects) and Stack (for method executions and primitive types). Garbage collection identifies and deallocates unreferenced objects across Young and Old generations. To diagnose an OutOfMemoryError, enable heap dumps with `-XX:+HeapDumpOnOutOfMemoryError` and analyze them with tools like Eclipse Memory Analyzer (MAT) or JProfiler to find leaking object references."
    },
    {
      q: "What is the difference between Synchronous and Asynchronous execution in Spring Boot, and how do you implement thread pools using `@Async`?",
      keywords: ["async", "thread pool", "executor", "future", "completablefuture", "non-blocking", "concurrency"],
      concepts: ["Spring `@Async`", "ThreadPoolTaskExecutor", "Concurrency management"],
      model: "Synchronous calls block the calling thread until a task finishes, while Asynchronous calls delegate work to background threads managed by a ThreadPoolTaskExecutor, returning immediately with a CompletableFuture. Proper configuration includes setting core pool size, max pool size, and queue capacity."
    }
  ],
  react: [
    {
      q: "How does the React Virtual DOM diffing algorithm (Reconciliation) work, and what strategies do you use to prevent unnecessary component re-renders?",
      keywords: ["virtual dom", "reconciliation", "fiber", "usememo", "usecallback", "react.memo", "keys", "diffing"],
      concepts: ["Virtual DOM vs Real DOM", "React.memo", "useCallback/useMemo optimization", "Key prop importance"],
      model: "React maintains a lightweight Virtual DOM in memory. During reconciliation, React compares the new tree with the previous one (using Fiber). Strategies to avoid wasted re-renders include wrapping pure components in React.memo, caching expensive computations with useMemo, passing stable callback references using useCallback, and using stable, unique keys in lists."
    },
    {
      q: "Explain how you handle global state management and side-effects in React. Compare Redux Toolkit with React Context API for enterprise applications.",
      keywords: ["redux", "context api", "reducers", "slices", "side effects", "middleware", "thunk", "re-render"],
      concepts: ["State management trade-offs", "Context performance limits", "Redux Toolkit architecture"],
      model: "Context API is ideal for low-frequency updates like themes or authenticated user sessions, but triggers re-renders across all consumers when state changes. Redux Toolkit provides predictable centralized state, fine-grained selector subscriptions (via useSelector), and structured middleware for side effects, making it scalable for complex data flows."
    }
  ],
  node: [
    {
      q: "Explain how the Node.js Event Loop handles asynchronous I/O operations and describe how microtasks (Promises, process.nextTick) differ from macrotasks.",
      keywords: ["event loop", "libuv", "single-threaded", "non-blocking", "microtask", "macrotask", "nexttick", "setimmediate"],
      concepts: ["Event loop phases (timers, poll, check)", "Microtask queue priority", "Libuv worker pool"],
      model: "Node.js utilizes a single-threaded event loop powered by libuv for non-blocking I/O. Microtasks (process.nextTick, Promise callbacks) execute immediately after the current operation finishes and take priority over macrotasks (setTimeout, setInterval, setImmediate) which execute during designated loop phases."
    },
    {
      q: "How do you secure Express.js REST APIs in production against common vulnerabilities like SQL/NoSQL injection, CORS misuse, and brute-force attacks?",
      keywords: ["jwt", "helmet", "rate limiting", "cors", "input validation", "bcrypt", "nosql injection", "sanitization"],
      concepts: ["OWASP Top 10 API Security", "Rate limiting with Redis", "Sanitization & Parameterized queries"],
      model: "API security involves using Helmet for HTTP headers, express-rate-limit to stop brute-forcing, strict CORS configurations, sanitizing inputs with Joi/Zod to prevent injection, hashing passwords with bcrypt (cost factor >= 10), and signing short-lived JWTs stored in HTTP-only, secure, SameSite cookies."
    }
  ],
  python: [
    {
      q: "What is the Global Interpreter Lock (GIL) in Python, and how do you build CPU-bound vs I/O-bound applications around it?",
      keywords: ["gil", "multiprocessing", "threading", "asyncio", "cpu-bound", "io-bound", "concurrency"],
      concepts: ["Python GIL mechanics", "Multiprocessing vs Multithreading", "Asyncio event loop"],
      model: "The GIL is a mutex that allows only one native thread to execute Python bytecode at a time. For I/O-bound tasks (network requests, DB calls), threading or asyncio works efficiently. For CPU-bound tasks (data processing, ML), the `multiprocessing` module is used to bypass the GIL by spawning separate processes with their own Python interpreter."
    }
  ],
  sql: [
    {
      q: "Explain the ACID properties in relational databases and how indexing (B-Tree vs Hash) improves query performance. When can indexing hurt performance?",
      keywords: ["acid", "atomicity", "consistency", "isolation", "durability", "indexing", "b-tree", "write performance", "execution plan"],
      concepts: ["ACID transaction guarantees", "B-Tree index structure", "Write overhead of excessive indexes"],
      model: "ACID ensures reliable transactions: Atomicity (all-or-nothing), Consistency (rules valid), Isolation (concurrent safety), and Durability (persisted on disk). Indexes allow fast B-Tree lookups reducing full-table scans. However, every additional index degrades INSERT, UPDATE, and DELETE operations because indexes must be updated synchronously."
    }
  ],
  mongodb: [
    {
      q: "How do you decide between embedding vs referencing documents in MongoDB schema design? What are the implications for data consistency and query performance?",
      keywords: ["embedding", "referencing", "normalization", "denormalization", "aggregation", "lookup", "16mb document limit"],
      concepts: ["1:1 and 1:N schema modeling", "Read performance vs write duplication", "MongoDB Aggregation framework"],
      model: "Embedding is preferred for 1:few relationships or data queried together, providing fast atomic single-document reads. Referencing (normalized) is preferred for 1:many or frequently updated shared data to prevent unbound document growth exceeding the 16MB BSON limit."
    }
  ],
  aws: [
    {
      q: "Describe how you would architect a scalable, fault-tolerant web application using AWS services (EC2/ECS, S3, RDS, CloudFront, Lambda).",
      keywords: ["s3", "ec2", "ecs", "rds", "lambda", "cloudfront", "load balancer", "auto scaling", "multi-az"],
      concepts: ["AWS multi-tier architecture", "High availability and Multi-AZ", "Stateless compute and S3 storage"],
      model: "An optimal AWS architecture uses CloudFront for edge caching static assets hosted on S3, an Application Load Balancer (ALB) routing traffic to auto-scaled ECS containers or EC2 instances across Multi-AZ subnets, and an RDS database with Multi-AZ read replicas. Asynchronous tasks and event processing run serverlessly via AWS Lambda."
    }
  ],
  docker: [
    {
      q: "Explain multi-stage Docker builds and describe best practices for containerizing production web applications.",
      keywords: ["dockerfile", "multi-stage", "layer caching", "alpine", "non-root user", "image size", "security"],
      concepts: ["Multi-stage builds", "Layer optimization", "Container security"],
      model: "Multi-stage builds separate the build environment (compilers, build tools) from the final minimal runtime image (e.g. node:alpine), drastically reducing image size and attack surface. Best practices include running containers as a non-root user, ordering commands to maximize layer caching, and using `.dockerignore`."
    }
  ]
};

// General fallback questions
const GENERAL_QUESTION_POOL = [
  {
    q: "Walk me through a complex technical challenge you encountered in a recent project. How did you diagnose the root cause and what was your solution?",
    category: "Technical",
    context: "General Engineering & Problem-Solving",
    expectedKeywords: ["problem", "root cause", "debugging", "solution", "testing", "outcome", "impact"],
    suggestedConcepts: ["Problem diagnosis", "Analytical thinking", "Measurable resolution"]
  },
  {
    q: "How do you ensure the code you write is maintainable, well-tested, and secure before pushing it to production?",
    category: "Scenario",
    context: "Software Quality & Engineering Standards",
    expectedKeywords: ["unit tests", "code review", "ci/cd", "clean code", "documentation", "linting", "security"],
    suggestedConcepts: ["Testing methodologies (unit, integration)", "Automated pipelines", "Clean architecture"]
  },
  {
    q: "Describe a situation where project requirements were ambiguous or changed midway through development. How did you adapt?",
    category: "Behavioral",
    context: "Adaptability & Communication",
    expectedKeywords: ["communication", "clarification", "agile", "prioritization", "stakeholders", "teamwork"],
    suggestedConcepts: ["Cross-team collaboration", "Agile response", "Requirement clarification"]
  },
  {
    q: "Why are you interested in this specific role and company, and what unique technical strengths do you bring to our team?",
    category: "HR",
    context: "Role Motivation & Culture Fit",
    expectedKeywords: ["interest", "skills", "growth", "company mission", "collaboration", "contribution"],
    suggestedConcepts: ["Alignment with company goals", "Self-awareness", "Career objectives"]
  }
];

/**
 * Extracts key technology names and requirements from job description and requirements.
 */
export const extractJobKeywords = (job) => {
  const text = `${job.title || ""} ${(job.requirements || []).join(" ")} ${job.description || ""}`.toLowerCase();
  const detected = [];

  Object.keys(TECH_QUESTION_BANK).forEach((tech) => {
    const regex = new RegExp(`\\b${tech}\\b`, "i");
    if (regex.test(text)) {
      detected.push(tech);
    }
  });

  return detected;
};

/**
 * Generates tailored interview questions based on job description, requirements, and candidate profile.
 */
export const generateJobSpecificQuestions = (job, studentProfile = null, interviewType = "Mixed") => {
  if (!job) {
    return GENERAL_QUESTION_POOL.map((q, idx) => ({
      id: `gen_${idx}_${Date.now()}`,
      ...q,
      studentAnswer: ""
    }));
  }

  const detectedTech = extractJobKeywords(job);
  const questions = [];
  let questionCounter = 1;

  // 1. Technical Questions based on required skills
  if (["Technical", "Mixed"].includes(interviewType)) {
    detectedTech.forEach((tech) => {
      const bank = TECH_QUESTION_BANK[tech];
      if (bank && bank.length > 0) {
        // Pick top relevant question
        const chosen = bank[Math.floor(Math.random() * bank.length)];
        questions.push({
          id: `tech_${tech}_${questionCounter++}`,
          question: chosen.q,
          category: "Technical",
          context: `Targeted for required skill: ${tech.toUpperCase()}`,
          expectedKeywords: chosen.keywords,
          suggestedConcepts: chosen.concepts,
          studentAnswer: ""
        });
      }
    });

    // If no predefined tech questions matched, generate a tailored prompt using job requirements
    if (questions.length === 0 && job.requirements?.length > 0) {
      const topReq = job.requirements.slice(0, 2).join(", ");
      questions.push({
        id: `tech_req_${questionCounter++}`,
        question: `This role specifically requires hands-on proficiency in ${topReq}. Describe your architectural approach, best practices, and challenges you've faced when working with these technologies.`,
        category: "Technical",
        context: `Derived from Job Requirements: ${topReq}`,
        expectedKeywords: job.requirements.map(r => r.toLowerCase()),
        suggestedConcepts: ["Core technical architecture", "Best practices", "Performance optimization"],
        studentAnswer: ""
      });
    }
  }

  // 2. Practical Scenario / Responsibilities Questions
  if (["Technical", "Mixed", "Behavioral"].includes(interviewType)) {
    const cleanDesc = (job.description || "").replace(/<[^>]*>?/gm, "").trim();
    const shortDesc = cleanDesc.length > 150 ? cleanDesc.slice(0, 150) + "..." : cleanDesc;

    questions.push({
      id: `scen_${questionCounter++}`,
      question: `According to the job description for ${job.title || "this role"}, you will be responsible for building key components and collaborating with cross-functional teams. How would you plan, architect, and deliver a new feature from conception to production deployment?`,
      category: "Scenario",
      context: `Based on Job Responsibilities: "${shortDesc || job.title}"`,
      expectedKeywords: ["architecture", "requirements", "design", "testing", "deployment", "monitoring", "git"],
      suggestedConcepts: ["SDLC Lifecycle", "System Design", "Release management"],
      studentAnswer: ""
    });
  }

  // 3. Project & Resume Alignment Question
  if (studentProfile?.skills?.length > 0 || studentProfile?.bio) {
    const studentSkills = studentProfile.skills.slice(0, 4).join(", ");
    questions.push({
      id: `proj_${questionCounter++}`,
      question: `Your profile highlights experience with ${studentSkills}. Can you detail a production or capstone project where you utilized these skills, and explain how that experience directly prepares you for the responsibilities of ${job.title}?`,
      category: "Resume-Based",
      context: "Connecting your personal profile projects to this position",
      expectedKeywords: studentProfile.skills.map(s => s.toLowerCase()),
      suggestedConcepts: ["Project impact", "Measurable outcomes", "Technology translation to role"],
      studentAnswer: ""
    });
  } else {
    questions.push({
      id: `proj_${questionCounter++}`,
      question: `Discuss the most technically challenging project you have worked on. What were your specific architectural contributions and what measurable results or performance improvements did you achieve?`,
      category: "Scenario",
      context: "Project Contribution & Engineering Impact",
      expectedKeywords: ["architecture", "contributions", "metrics", "scale", "performance", "impact"],
      suggestedConcepts: ["STAR Method (Situation, Task, Action, Result)", "Measurable outcomes"],
      studentAnswer: ""
    });
  }

  // 4. Behavioral & HR Questions
  if (["HR", "Behavioral", "Mixed"].includes(interviewType)) {
    questions.push({
      id: `beh_${questionCounter++}`,
      question: `At ${job.company?.name || "our company"}, engineering teams operate in fast-paced environments. Tell me about a time you had a technical disagreement with a teammate or lead regarding an implementation. How was it resolved?`,
      category: "Behavioral",
      context: "Team Dynamics & Conflict Resolution",
      expectedKeywords: ["communication", "data-driven", "consensus", "respect", "trade-offs", "resolution"],
      suggestedConcepts: ["Constructive disagreement", "Data-backed reasoning", "Collaboration"],
      studentAnswer: ""
    });

    questions.push({
      id: `hr_${questionCounter++}`,
      question: `What excites you most about the prospect of joining ${job.company?.name || "this team"} as a ${job.title}, and where do you see your technical trajectory over the next 2-3 years?`,
      category: "HR",
      context: "Career Vision & Company Alignment",
      expectedKeywords: ["growth", "learning", "impact", "mentorship", "leadership", "mission"],
      suggestedConcepts: ["Career goals", "Alignment with company vision", "Long-term commitment"],
      studentAnswer: ""
    });
  }

  // Fallback if list is too small
  if (questions.length < 4) {
    GENERAL_QUESTION_POOL.slice(0, 4 - questions.length).forEach((gq) => {
      questions.push({
        id: `gen_${questionCounter++}`,
        ...gq,
        studentAnswer: ""
      });
    });
  }

  return questions;
};

/**
 * Evaluates student responses to interview questions against job description and expected concepts.
 */
export const evaluateInterviewAnswers = (interview, submittedQuestions = []) => {
  const questionsToEval = submittedQuestions.length > 0 ? submittedQuestions : interview.questions || [];

  let totalScoreSum = 0;
  let technicalScoreSum = 0;
  let technicalCount = 0;
  let completenessScoreSum = 0;
  let clarityScoreSum = 0;

  const questionFeedbackList = [];
  const identifiedStrengths = [];
  const identifiedImprovements = [];
  const recommendedTopicsSet = new Set();

  questionsToEval.forEach((q) => {
    const answer = (q.studentAnswer || "").trim();
    const answerWords = answer.toLowerCase().split(/\s+/).filter(Boolean);
    const wordCount = answerWords.length;

    const expectedKws = q.expectedKeywords || [];
    const matchedKws = [];
    const missingKws = [];

    expectedKws.forEach((kw) => {
      const regex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      if (regex.test(answer.toLowerCase())) {
        matchedKws.push(kw);
      } else {
        missingKws.push(kw);
      }
    });

    // Score components for this question (0 - 100)
    let qScore = 0;
    let feedbackNotes = [];

    if (wordCount === 0) {
      qScore = 0;
      feedbackNotes.push("Question was left unanswered.");
      if (q.suggestedConcepts?.length > 0) {
        q.suggestedConcepts.forEach(c => recommendedTopicsSet.add(c));
      }
    } else if (wordCount < 15) {
      qScore = 30;
      feedbackNotes.push("Answer is overly brief. Elaborate with concrete examples and technical depth.");
      missingKws.slice(0, 3).forEach(k => recommendedTopicsSet.add(k));
    } else {
      // 1. Keyword & concept coverage (up to 50 pts)
      const keywordRatio = expectedKws.length > 0 ? matchedKws.length / expectedKws.length : 0.7;
      const kwScore = Math.min(50, Math.round(keywordRatio * 50));

      // 2. Depth & explanation length (up to 30 pts)
      let depthScore = 0;
      if (wordCount >= 80) depthScore = 30;
      else if (wordCount >= 40) depthScore = 22;
      else depthScore = 15;

      // 3. Technical structure / action words (up to 20 pts)
      let structureScore = 15;
      if (/\b(?:because|therefore|specifically|for example|in my project|resulted in)\b/i.test(answer)) {
        structureScore = 20;
      }

      qScore = Math.min(100, Math.max(25, kwScore + depthScore + structureScore));

      if (matchedKws.length > 0) {
        feedbackNotes.push(`Well done covering key concepts: ${matchedKws.slice(0, 3).join(", ")}.`);
      }
      if (missingKws.length > 0) {
        feedbackNotes.push(`Consider addressing: ${missingKws.slice(0, 3).join(", ")} to demonstrate comprehensive mastery.`);
        missingKws.slice(0, 2).forEach(k => recommendedTopicsSet.add(k));
      }
    }

    // Accumulate category scores
    totalScoreSum += qScore;
    completenessScoreSum += wordCount >= 50 ? 90 : Math.round((wordCount / 50) * 85);
    clarityScoreSum += qScore >= 70 ? 88 : 70;

    if (q.category === "Technical" || q.category === "Scenario") {
      technicalScoreSum += qScore;
      technicalCount++;
    }

    questionFeedbackList.push({
      questionId: q.id,
      question: q.question,
      category: q.category,
      score: qScore,
      feedback: feedbackNotes.join(" "),
      coveredConcepts: matchedKws,
      missingConcepts: missingKws,
      modelAnswer: q.suggestedConcepts?.length > 0
        ? `Focus on: ${q.suggestedConcepts.join(" • ")}`
        : "Explain the architectural rationale, technical trade-offs, and measurable project outcomes."
    });
  });

  const questionCount = questionsToEval.length || 1;
  const overallScore = Math.round(totalScoreSum / questionCount);
  const technicalScore = technicalCount > 0 ? Math.round(technicalScoreSum / technicalCount) : overallScore;
  const completenessScore = Math.round(completenessScoreSum / questionCount);
  const clarityScore = Math.round(clarityScoreSum / questionCount);

  // Derive overarching strengths and improvements
  if (overallScore >= 75) {
    identifiedStrengths.push("Demonstrated strong technical command and clear alignment with the job requirements.");
    identifiedStrengths.push("Structured answers with good context, explanation depth, and relevant examples.");
  } else if (overallScore >= 50) {
    identifiedStrengths.push("Solid foundational knowledge on core concepts with relevant technical awareness.");
  } else {
    identifiedStrengths.push("Completed interview session and engaged with role-specific questions.");
  }

  if (completenessScore < 70) {
    identifiedImprovements.push("Provide more detailed explanations using the STAR method (Situation, Task, Action, Result).");
  }
  if (technicalScore < 70) {
    identifiedImprovements.push(`Strengthen depth in key technologies required for ${interview.jobTitle || "this position"}.`);
  }
  if (identifiedImprovements.length === 0) {
    identifiedImprovements.push("Continue practicing scenario-based system design questions under timed conditions.");
  }

  // Ensure default recommended topics
  if (recommendedTopicsSet.size === 0) {
    (interview.requiredSkills || []).forEach(s => recommendedTopicsSet.add(s));
    recommendedTopicsSet.add("System Design");
    recommendedTopicsSet.add("Behavioral STAR Interviewing");
  }

  return {
    overallScore,
    technicalScore,
    completenessScore,
    clarityScore,
    strengths: identifiedStrengths,
    improvements: identifiedImprovements,
    questionFeedback: questionFeedbackList,
    recommendedTopics: Array.from(recommendedTopicsSet).slice(0, 6),
    evaluatedAt: new Date()
  };
};
