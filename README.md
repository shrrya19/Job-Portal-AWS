# CareerNest – AWS-Based Student Job Portal

[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-5.2-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_9-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![AWS Target](https://img.shields.io/badge/AWS_Target-EC2_%7C_RDS_%7C_S3-FF9900?logo=amazon-aws&logoColor=white)](https://aws.amazon.com/)

CareerNest is a full-stack, enterprise-grade student job portal and career preparation platform designed to bridge the gap between emerging student talent and hiring organizations. Built as a unified system, CareerNest combines end-to-end recruitment pipelines, applicant tracking, heuristic ATS resume parsing, and job-description-driven interview simulation into a single, intuitive platform.

> [!IMPORTANT]
> **Implementation vs. Cloud Deployment Notice:**  
> The checked-in codebase is implemented with **MongoDB (via Mongoose ODM)** and uses **Cloudinary** (with an automatic fallback to local disk storage in `Backend/uploads/`) for file and image management. The target enterprise cloud architecture described in [Section 9](#9-aws-deployment-guide) specifies **Amazon EC2**, **Amazon RDS (PostgreSQL)**, and **Amazon S3**. Because Amazon RDS is a relational database service that does not support MongoDB/Mongoose natively, a data-layer migration (such as Prisma, Drizzle, or TypeORM) and an AWS SDK S3 storage adapter are required before deploying to RDS and S3. A complete, step-by-step migration guide is provided in this documentation.

---

## Table of Contents

1. [About the Project](#1-about-the-project)
   - [Overview and Purpose](#overview-and-purpose)
   - [Core Objectives](#core-objectives)
   - [Connecting Students and Recruiters](#connecting-students-and-recruiters)
   - [Problems Solved](#problems-solved)
2. [Project Architecture](#2-project-architecture)
   - [System Architecture Overview](#system-architecture-overview)
   - [System Architecture Diagram](#system-architecture-diagram)
   - [Data and Execution Flow](#data-and-execution-flow)
3. [Technology Stack](#3-technology-stack)
   - [Stack Summary Table](#stack-summary-table)
   - [Detailed Component Breakdown](#detailed-component-breakdown)
4. [Existing Project Features](#4-existing-project-features)
   - [Feature Matrix](#feature-matrix)
   - [Core Features Summary](#core-features-summary)
5. [Implemented Features and Key Demonstrations](#5-implemented-features-and-key-demonstrations)
   - [Demonstration 1: ATS Resume Builder & Analyzer](#demonstration-1-ats-resume-builder--analyzer)
   - [Demonstration 2: Job-Description Based Mock Interview Simulator](#demonstration-2-job-description-based-mock-interview-simulator)
   - [Demonstration 3: End-to-End Application Tracking Pipeline](#demonstration-3-end-to-end-application-tracking-pipeline)
6. [Project Structure](#6-project-structure)
   - [Directory Tree](#directory-tree)
   - [Key Directories and Module Purposes](#key-directories-and-module-purposes)
7. [Local Setup Guide](#7-local-setup-guide)
   - [Prerequisites](#prerequisites)
   - [Step 1: Clone Repository](#step-1-clone-repository)
   - [Step 2: Backend Configuration & Startup](#step-2-backend-configuration--startup)
   - [Step 3: Frontend Configuration & Startup](#step-3-frontend-configuration--startup)
   - [Step 4: Running Verification Tests](#step-4-running-verification-tests)
   - [Step 5: Populating Demo Marketplace Data](#step-5-populating-demo-marketplace-data)
8. [Future Scope](#8-future-scope)
9. [AWS Deployment Guide](#9-aws-deployment-guide)
   - [Target Architecture Overview](#target-architecture-overview)
   - [Architecture Diagram (AWS Production Target)](#architecture-diagram-aws-production-target)
   - [Database Migration Considerations (MongoDB to RDS PostgreSQL)](#database-migration-considerations-mongodb-to-rds-postgresql)
   - [Step-by-Step EC2, RDS, and S3 Deployment](#step-by-step-ec2-rds-and-s3-deployment)
   - [Nginx Reverse Proxy & SSL Configuration](#nginx-reverse-proxy--ssl-configuration)
   - [Security Groups & IAM Roles Configuration](#security-groups--iam-roles-configuration)
10. [Documentation & Audit Quality](#10-documentation--audit-quality)

---

## 1. About the Project

### Overview and Purpose
**CareerNest** is an integrated career-readiness and employment marketplace built specifically for academic institutions, graduating students, entry-level job seekers, and hiring companies. It transforms the conventional job board experience into an end-to-end recruitment journey: from resume optimization and role-specific mock interview training to verified job applications and real-time hiring pipeline monitoring.

### Core Objectives
1. **Accelerate Student Employability:** Provide automated, transparent tools that diagnose resume defects against Applicant Tracking Systems (ATS) and deliver realistic technical/behavioral interview practice before students interview with real employers.
2. **Streamline Campus & Corporate Hiring:** Supply corporate recruiters with structured company profiles, granular role management, automated ATS candidate ranking, and an intuitive applicant management pipeline.
3. **Decentralize Career Support:** Enable universities and bootcamps to host career fairs, webinars, and placement events while maintaining data privacy, access controls, and verifiable applicant records.

### Connecting Students and Recruiters
CareerNest operates a dual-sided ecosystem backed by robust Role-Based Access Control (RBAC):
- **On the Student Side:** Candidates register, craft standardized ATS resumes, upload existing PDF/DOCX resumes for scoring, take self-guided mock interviews tied to live job descriptions, register for corporate events, and track job applications across real-time hiring stages.
- **On the Recruiter Side:** Authorized recruiters register verified company profiles, post opportunities across standardized employment types (*Full-Time*, *Contract*, *Internship*), search and filter candidates, schedule interviews with live links or venue locations, issue compensation offers, and record private hiring notes.

### Problems Solved
- **The "Black Box" Application Void:** Students traditionally apply to jobs without feedback on their application status. CareerNest introduces a visual 5-stage tracker (`Applied` $\rightarrow$ `Shortlisted` $\rightarrow$ `Interview` $\rightarrow$ `Offer Extended` $\rightarrow$ `Hired` / `Declined`).
- **ATS Formatting Disconnect:** Over 75% of student resumes fail automated parsing due to complex multi-column layouts, missing standard headers, or passive language. CareerNest evaluates resumes deterministically across 5 dimensions and includes a single-column, ATS-safe PDF generator.
- **Unprepared Interview Candidates:** General interview prep questions are often disconnected from actual job postings. CareerNest parses the specific job description and student resume to synthesize tailored technical, scenario, and behavioral questions.
- **Recruiter Screening Fatigue:** High-volume entry-level postings overwhelm recruiters. CareerNest provides automated candidate ranking scoring applicants against exact job requirements, skills, and educational qualifications.

---

## 2. Project Architecture

### System Architecture Overview
The application follows a decoupled, three-tier Single Page Application (SPA) and REST API architecture:
1. **Client Tier (Frontend):** A reactive SPA built on **React 18** and **Vite 8**, utilizing **Redux Toolkit** and **Redux Persist** for client state management, **Tailwind CSS 4** for styling, and **Framer Motion** for UI transitions.
2. **Application Tier (Backend):** A modular **Express 5** RESTful service running on **Node.js 22** in ES Module mode. It manages cross-origin communication, enforces JWT authentication via HTTP-only cookies and bearer headers, handles multipart uploads with **Multer**, and executes deterministic ATS and interview analysis algorithms.
3. **Data Tier (Database & Storage):** Persisted in **MongoDB** using **Mongoose 9** across seven normalized document models. File assets (profile photos, company logos, resumes) are uploaded to **Cloudinary** when configured, or saved securely to the local disk (`Backend/uploads/`).

### System Architecture Diagram

```mermaid
flowchart TD
    subgraph ClientTier ["Frontend Tier (Client - React SPA)"]
        Browser["User Browser"]
        ViteSPA["React 18 SPA (Vite 8, Redux Toolkit, Tailwind CSS)"]
        Browser --> ViteSPA
    end

    subgraph AuthSecurity ["Authentication & Routing Layer"]
        CORS["CORS & Cookie Parser"]
        JWTAuth["JWT & Role Authorization (Student / Recruiter)"]
        ViteSPA -->|REST API Requests with Credentials| CORS
        CORS --> JWTAuth
    end

    subgraph BackendTier ["Application Tier (Node.js & Express 5 API)"]
        UserCtrl["User & Profile Controller"]
        JobCtrl["Job & Search Controller"]
        AppCtrl["Application Pipeline Controller"]
        RecCtrl["Recruiter Analytics & Ranking Controller"]
        ResumeCtrl["ATS Resume Engine & Mammoth/pdf-parse"]
        InterviewCtrl["Mock Interview Question & Evaluation Engine"]
        EventCtrl["Campus Events Controller"]

        JWTAuth --> UserCtrl
        JWTAuth --> JobCtrl
        JWTAuth --> AppCtrl
        JWTAuth --> RecCtrl
        JWTAuth --> ResumeCtrl
        JWTAuth --> InterviewCtrl
        JWTAuth --> EventCtrl
    end

    subgraph DataTier ["Persistence Tier (Database & File Storage)"]
        Mongo[(MongoDB Database)]
        Mongoose["Mongoose 9 ODM (7 Schemas)"]
        UploadStorage{Storage Strategy}
        Cloudinary["Cloudinary CDN"]
        LocalDisk["Local Disk Fallback (Backend/uploads/)"]

        UserCtrl & JobCtrl & AppCtrl & RecCtrl & EventCtrl --> Mongoose
        ResumeCtrl & InterviewCtrl --> Mongoose
        Mongoose --> Mongo

        UserCtrl & ResumeCtrl & JobCtrl --> UploadStorage
        UploadStorage -->|Cloudinary Configured| Cloudinary
        UploadStorage -->|Missing Keys / Local Fallback| LocalDisk
    end
```

### Data and Execution Flow
1. **Authentication Flow:** User submits credentials $\rightarrow$ Password verified via `bcryptjs` $\rightarrow$ Server issues a signed JWT $\rightarrow$ Token attached to HTTP-only cookie and bearer response $\rightarrow$ Subsequent requests validated via `isAuthenticated.js` middleware.
2. **Resume Analysis Flow:** Student uploads PDF/DOCX $\rightarrow$ Multer buffers in memory $\rightarrow$ `pdf-parse` or `mammoth` extracts raw text $\rightarrow$ `atsAnalyzer.js` parses sections, contact info, action verbs, measurable metrics, and hard skills $\rightarrow$ Deterministic score and improvement recommendations returned.
3. **Application Pipeline Flow:** Student applies $\rightarrow$ Record created with status `applied` and initial history log $\rightarrow$ Recruiter updates stage $\rightarrow$ Transition rules verified $\rightarrow$ Optional interview details or compensation terms attached $\rightarrow$ Student reviews details on dashboard and responds to offers.

---

## 3. Technology Stack

### Stack Summary Table

| Layer | Primary Technology | Version / Specification | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React | 18.3.1 | Component-driven reactive UI architecture |
| **Build & Tooling** | Vite | 8.0.12 | Ultra-fast HMR and optimized production bundling |
| **State Management** | Redux Toolkit & Persist | 2.12.0 / 6.0.0 | Global predictable state and local storage synchronization |
| **Routing** | React Router | 7.16.0 | Client-side routing, route protection, and parameters |
| **Styling & Icons** | Tailwind CSS & Lucide | 4.3.0 / 1.17.0 | Modern utility styling and accessible SVG icons |
| **Animation & Feedback** | Framer Motion & Sonner | 12.41.0 / 2.0.7 | Fluid UI transitions and toast notifications |
| **Backend Runtime** | Node.js | 20.19+ / 22.x LTS | Server-side JavaScript execution (ES Modules) |
| **API Framework** | Express | 5.2.1 | REST routing, middleware chaining, error handling |
| **Database & ODM** | MongoDB & Mongoose | Mongoose 9.5.0 | Schema-backed NoSQL persistence and query population |
| **Authentication** | JSON Web Tokens & bcryptjs | 9.0.3 / 3.0.3 | Stateless token validation and cryptographic password hashing |
| **Document Parsing** | pdf-parse & Mammoth | 2.4.5 / 1.13.0 | Text stream extraction from binary PDF and Word documents |
| **File Uploads** | Multer & DataURI | 2.1.1 / 4.1.0 | Multipart form-data handling and memory stream buffering |
| **File Storage** | Cloudinary / Local Disk | SDK 2.10.0 | Media hosting with automated fallback to `Backend/uploads/` |
| **PDF Generation** | jsPDF & html2canvas | 4.2.1 / 1.4.1 | Client-side ATS resume PDF rendering and export |
| **Testing** | Node.js Test Suite | Custom Asserts | Deterministic test harnesses for ATS, interview, and seeding |

### Detailed Component Breakdown
- **Frontend Architecture:** Utilizes modular layouts (`Navbar`, `Footer`, `FilterCard`, `LatestJobs`) with specialized dashboards for students and recruiters. Redux stores auth tokens, active applications, job filters, and recruiter job listings.
- **Backend Architecture:** REST controllers enforce input validation, strict user ownership (`created_by === req.id`), and defensive error handling.
- **Database Layer:** Seven Mongoose models:
  - `User`: Handles identity, roles (`student`/`recruiter`), hashed passwords, profile bio, skills, resume URL, and saved jobs.
  - `Company`: Stores company branding, website, industry, description, and founding recruiter link.
  - `Job`: Houses role metadata, location, job type (`Full-Time`, `Contract`, `Internship`), experience requirements, salary ranges, deadlines, and application references.
  - `Application`: Tracks the candidate-to-job link, recruitment stages, interview schedules, compensation offers, and recruiter private notes.
  - `Resume`: Maintains raw extracted text, ATS score breakdowns, detected skills, and customized resume drafts.
  - `Interview`: Stores mock interview sessions, questions, student answer submissions, scores, and feedback.
  - `Event`: Manages campus placements, webinars, and registered student attendee IDs.

---

## 4. Existing Project Features

CareerNest includes a comprehensive suite of features verified against the active codebase:

| Feature Name | Description | User Scope |
| :--- | :--- | :--- |
| **Role-Based Authentication & Profiles** | Secure registration and login enforcing strict password policies, Indian phone validation, profile photo uploads, bio management, and role-specific dashboard routing. | Student & Recruiter |
| **Job & Internship Discovery Board** | Interactive job boards with real-time filtering by role, location, salary, experience, and employment mode. Dedicated `/internships` tab isolates early-career roles from standard full-time jobs. | Student |
| **Smart Dashboard Search Bars** | Prominent search bars with debounced live suggestions on both student and recruiter dashboards, querying job titles, companies, custom Job IDs, locations, and applicant names. | Student & Recruiter |
| **ATS Resume Builder & Analyzer** | Extracts text from PDF/DOCX files, evaluates resumes across 5 ATS quality metrics, provides actionable bullet-point rewriting suggestions, and exports ATS-safe resumes to PDF. | Student |
| **Mock Interview Simulator** | Generates job-tailored technical, scenario, and behavioral questions based on actual job requirements, evaluates answers, and generates STAR-method feedback scores. | Student |
| **Application Tracking Pipeline** | Live tracking across recruitment stages (`applied` $\rightarrow$ `shortlisted` $\rightarrow$ `interview` $\rightarrow$ `offer extended` $\rightarrow$ `hired`/`declined`), featuring interview scheduling details and offer acceptance actions. | Student & Recruiter |
| **Recruiter Job & Company Management** | Full CRUD capabilities for corporate recruiters to register companies, post jobs with a 3-tier `jobType` dropdown (`Full-Time`, `Contract`, `Internship`), edit listings, and delete roles. | Recruiter |
| **Candidate Ranking Engine** | Deterministic ATS heuristic scoring ranking applicants against specific job requirements, detecting matched keywords, missing terms, and relevant education/experience evidence. | Recruiter |
| **Campus Career Events Hub** | Recruiter event creation and management interface paired with a student-facing event discovery and one-click registration portal with capacity enforcement. | Student & Recruiter |

---

## 5. Implemented Features and Key Demonstrations

This section showcases the three core functional pillars implemented within the application.

```
+---------------------------------------------------------------------------------------------------+
|                                     CAREERNEST VISUAL ASSET                                       |
|                                                                                                   |
|                                    [ CareerNest Official Logo ]                                   |
|                             Path: Frontend/src/assets/Logo_Org.png                                |
+---------------------------------------------------------------------------------------------------+
```

### Demonstration 1: ATS Resume Builder & Analyzer
The ATS Resume suite allows students to evaluate an existing resume or build one from scratch using a single-column, ATS-optimized layout.

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant UI as Frontend (AtsResumeHub)
    participant API as Express API (/api/v1/resume)
    participant Parser as pdf-parse / mammoth
    participant Engine as atsAnalyzer.js
    participant DB as MongoDB (Resume Model)

    Student->>UI: Upload resume (.pdf / .docx)
    UI->>API: POST /upload (Multipart Form Data)
    API->>Parser: Extract raw plaintext from document buffer
    Parser-->>API: Extracted document text
    API->>Engine: analyzeResumeText(extractedText)
    Note over Engine: Evaluates Contact, Sections, Action Verbs, Metrics, and Tech Skills
    Engine-->>API: Deterministic score (0-100), breakdown, strengths, weak bullets
    API->>DB: Save Resume record (linked to applicant)
    DB-->>API: Persisted resume document
    API-->>UI: Return full ATS diagnostics & suggestions
    UI-->>Student: Display visual score breakdown, keyword matching, & bullet rewrites
```

- **File Upload & Text Extraction:** Students upload `.pdf` or `.docx` files up to 5MB. The server parses text in-memory using `pdf-parse` or `mammoth`.
- **ATS Scoring Engine:** Scores resumes deterministically across five key criteria:
  - *Contact Info (15%):* Email, phone, LinkedIn, GitHub.
  - *Core Sections (25%):* Summary, Experience, Education, Skills, Projects.
  - *Bullet Quality (25%):* Presence of strong action verbs (*Spearheaded*, *Engineered*, *Optimized*) and quantified metrics (percentages, numbers).
  - *Skill Breadth (20%):* Coverage of technical keywords matching industry standards.
  - *Formatting & Length (15%):* Word count within the ideal 350–800 word range.
- **Job Description Matcher:** Compares resume content against any selected job description, highlighting matched skills, missing keywords, and role alignment advice.
- **Resume Builder:** Form-driven editor that saves drafts and exports clean, single-column PDFs using `jspdf` and `html2canvas`.

---

### Demonstration 2: Job-Description Based Mock Interview Simulator
The interview preparation module provides structured mock interviews based on the exact job description of any applied or saved job.

```mermaid
flowchart TD
    A[Student Selects Eligible Job] --> B[System Parses Job Description & Requirements]
    B --> C[demoInterviewEngine.js Synthesizes Role-Specific Questions]
    C --> D[Interview Session Starts]
    D --> E[Technical Deep-Dive Questions]
    D --> F[Job Scenario Questions]
    D --> G[Candidate Profile & Behavioral Questions]
    E & F & G --> H[Student Submits Answers]
    H --> I[Heuristic Keyword & STAR Analysis]
    I --> J[Instant Performance Feedback & Topic Recommendations]
```

- **Dynamic Question Synthesis:** Generates 5–7 questions categorized into Technical, Scenario, Resume-Based, Behavioral, and HR questions based on the job's title, requirements, and responsibilities.
- **Practice Session Environment:** Tracks question-by-question responses with autosave functionality to prevent progress loss.
- **Evaluation & Feedback:** Analyzes submissions for technical depth, completeness, and structure, returning:
  - Overall performance score (0–100).
  - Technical accuracy and depth scores.
  - Detected strengths and areas for improvement.
  - Recommended study topics tailored to the job description.

---

### Demonstration 3: End-to-End Application Tracking Pipeline
A structured recruitment pipeline giving both candidates and hiring managers complete transparency.

```mermaid
stateDiagram-v2
    [*] --> Applied: Candidate applies to active job
    Applied --> Shortlisted: Recruiter reviews qualifications
    Applied --> Declined: Application does not meet criteria
    Shortlisted --> InterviewScheduled: Recruiter schedules interview (Date, Time, Link/Venue)
    Shortlisted --> Declined: Interview not scheduled
    InterviewScheduled --> OfferExtended: Candidate clears interview (Compensation issued)
    InterviewScheduled --> Declined: Candidate fails interview
    OfferExtended --> Hired: Student accepts offer terms
    OfferExtended --> Declined: Student declines offer terms
    Hired --> [*]
    Declined --> [*]
```

- **Recruiter Pipeline Controls:** Accessible from `/admin/jobs/:id/applicants`. Recruiters can advance stages, record private recruiter notes, schedule interviews (with date, time, mode, meeting link, or physical venue), and extend formal offers with compensation figures.
- **Student Dashboard Tracker:** Visual 5-step tracker showing real-time stage progression, interview schedules with upcoming reminders, and active offers.
- **Offer Decision Workflow:** When an offer is extended, students can accept or reject the offer directly from their dashboard. The response is permanently logged in the application's audit history.

---

## 6. Project Structure

The repository is organized as a clean decoupled monorepo:

```text
Job_Portal-main/
├── README.md                          # Comprehensive project documentation
├── package.json                       # (Optional workspace root config)
│
├── Backend/                           # Node.js + Express REST API
│   ├── controllers/                   # HTTP Request Handlers
│   │   ├── application.controller.js  # Application creation, stages, offers, and decisions
│   │   ├── company.controller.js      # Company creation, lookup, and updates
│   │   ├── event.controller.js        # Event CRUD and student event registration
│   │   ├── interview.controller.js    # Mock interview generation, answers, and evaluation
│   │   ├── job.controller.js          # Job CRUD, suggestions, search, and status toggling
│   │   ├── recruiter.controller.js    # Recruiter dashboard metrics, ranking, and search
│   │   ├── resume.controller.js       # Resume upload, text parsing, ATS scoring, and drafts
│   │   └── user.controller.js         # User registration, login, profile, and saved jobs
│   ├── middlewares/                   # Express Middlewares
│   │   ├── isAuthenticated.js         # JWT token verification and user context injection
│   │   └── mutler.js                  # Multer memory storage configuration for file uploads
│   ├── models/                        # Mongoose Schemas (MongoDB)
│   │   ├── application.model.js       # Application schema with stage history and offer details
│   │   ├── company.model.js           # Company profile and recruiter ownership
│   │   ├── event.model.js             # Campus event schema with registration list
│   │   ├── interview.model.js         # Interview session, questions, and scores
│   │   ├── job.model.js               # Job listing schema with type, salary, and requirements
│   │   ├── resume.model.js            # Resume text, score breakdown, and builder drafts
│   │   └── user.model.js              # User schema with roles, profile, and saved jobs
│   ├── routes/                        # Express API Routes (/api/v1/...)
│   │   ├── application.route.js
│   │   ├── company.route.js
│   │   ├── event.route.js
│   │   ├── interview.route.js
│   │   ├── job.route.js
│   │   ├── recruiter.route.js
│   │   ├── resume.route.js
│   │   └── user.route.js
│   ├── scripts/                       # Database Seeding & Maintenance
│   │   └── seed-demo-data.js          # Idempotent seeder: 60 companies, 60 recruiters, 240 jobs
│   ├── uploads/                       # Local File Storage Fallback
│   │   ├── companies/                 # Uploaded company logos
│   │   ├── profiles/                  # User avatar pictures
│   │   └── resumes/                   # Stored resume documents
│   ├── utils/                         # Core Business Logic & Helpers
│   │   ├── atsAnalyzer.js             # Deterministic ATS scoring and recommendation engine
│   │   ├── demoInterviewEngine.js     # Interview question synthesizer and evaluation engine
│   │   ├── demoSeedData.js            # Mock dataset definitions for testing
│   │   ├── fileStorage.js             # Cloudinary upload handler with local disk fallback
│   │   ├── datauri.js                 # Memory buffer to Data URI formatter
│   │   └── db.js                      # MongoDB connection bootstrap
│   ├── index.js                       # Express server entry point & middleware initialization
│   ├── package.json                   # Backend dependencies and scripts
│   └── .env.example                   # Environment configuration template
│
└── Frontend/                          # React 18 Single Page Application (Vite 8)
    ├── public/                        # Static web assets, favicon, icons
    ├── src/
    │   ├── assets/                    # Static branding images and sponsor logos
    │   ├── components/                # UI Pages and Features
    │   │   ├── admin/                 # Recruiter dashboard, job posting, applicants table
    │   │   ├── auth/                  # Login and Signup forms with validation
    │   │   ├── events/                # Campus events listing and registration
    │   │   ├── interview/             # Mock interview session, question viewer, and feedback
    │   │   ├── resume/                # ATS resume upload, analysis cards, and PDF builder
    │   │   ├── shared/                # Navbar, Footer, ApplicationStageTracker, Datalists
    │   │   ├── ui/                    # Reusable shadcn/Radix UI primitive components
    │   │   ├── Home.jsx               # Foundit-inspired landing page with search and categories
    │   │   ├── Jobs.jsx               # Main job board and isolated internships view
    │   │   ├── JobDescription.jsx     # Detailed job overview and one-click application
    │   │   └── StudentDashboard.jsx   # Student workspace, search bar, and tracking pipeline
    │   ├── hooks/                     # Custom data-fetching hooks (useGetAllJobs, etc.)
    │   ├── redux/                     # Redux Toolkit store and slices (auth, job, company, etc.)
    │   ├── utils/                     # API endpoint constants (`constant.js`)
    │   ├── App.jsx                    # Route provider and route hierarchy configuration
    │   └── main.jsx                   # React DOM root mounting and Redux Provider wrapper
    ├── vite.config.js                 # Vite bundler configuration with Tailwind plugin
    └── package.json                   # Frontend dependencies and build scripts
```

---

## 7. Local Setup Guide

Follow these instructions to run the complete CareerNest platform locally.

### Prerequisites
- **Git:** Version 2.30+ installed.
- **Node.js:** Version `20.19+` or `22.12+` LTS (required for Vite 8 and Express 5).
- **npm:** Version 10.x+.
- **MongoDB:** A locally running MongoDB instance (`mongodb://127.0.0.1:27017`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) connection string.

### Step 1: Clone Repository
Open PowerShell or your preferred terminal:

```powershell
git clone https://github.com/shrrya19/Job-Portal-AWS.git
cd Job-Portal-AWS
```

### Step 2: Backend Configuration & Startup

1. Navigate to the backend directory:
   ```powershell
   cd Backend
   ```
2. Create your local environment file:
   ```powershell
   Copy-Item .env.example .env
   ```
3. Open `Backend/.env` and configure the required settings:
   ```dotenv
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/job-portal
   SECRET_KEY=generate_a_random_32_character_string_here
   FRONTEND_URL=http://localhost:5173
   BACKEND_URL=http://localhost:5000
   COOKIE_SAME_SITE=lax

   # Optional: Cloudinary Storage (Leave blank to use local disk storage in Backend/uploads/)
   CLOUD_NAME=
   API_KEY=
   API_SECRET=
   ```
   > Generate a secure `SECRET_KEY` using:
   > ```powershell
   > node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   > ```
4. Install dependencies:
   ```powershell
   npm install
   ```
5. Start the backend development server:
   ```powershell
   npm run dev
   ```
   The backend API will initialize on `http://localhost:5000`.

### Step 3: Frontend Configuration & Startup

1. Open a new terminal window and navigate to the `Frontend` directory:
   ```powershell
   cd Job-Portal-AWS/Frontend
   ```
2. Install frontend dependencies:
   ```powershell
   npm install
   ```
3. Start the Vite development server:
   ```powershell
   npm run dev
   ```
4. Access the web application at `http://localhost:5173`.

### Step 4: Running Verification Tests

Run the backend test suite to verify the ATS analyzer, mock interview engine, event validation, application stage transitions, and phone number validation:

```powershell
cd Job-Portal-AWS/Backend
npm test
```

Expected output:
```text
=== Testing ATS Resume Analyzer ===
ALL BACKEND ATS TESTS PASSED SUCCESSFULLY!
=== Testing Demo Interview Engine ===
ALL DEMO INTERVIEW TESTS PASSED SUCCESSFULLY!
ALL EVENT VALIDATION TESTS PASSED SUCCESSFULLY!
ALL APPLICATION STATUS TESTS PASSED SUCCESSFULLY!
ALL REGISTRATION DUPLICATE TESTS PASSED SUCCESSFULLY!
DEMO DATA TESTS PASSED: 60 companies, 60 recruiter accounts, 240 jobs.
```

Verify frontend build integrity:
```powershell
cd Job-Portal-AWS/Frontend
npm run build
```

### Step 5: Populating Demo Marketplace Data

CareerNest includes an idempotent demo seeder that generates 60 company profiles, 60 verified recruiter accounts, and 240 job postings (across Full-Time, Contract, and Internship roles).

1. Add the seeder authorization flags to your `Backend/.env`:
   ```dotenv
   ALLOW_DEMO_SEED=true
   DEMO_RECRUITER_PASSWORD=TestRecruiter@2026
   ```
   *(Note: The demo password must be at least 12 characters, start with an uppercase letter, and contain at least one number and one symbol).*
2. Perform a dry run to inspect the counts without touching the database:
   ```powershell
   npm run seed:demo:dry-run
   ```
3. Run the live seeder:
   ```powershell
   npm run seed:demo
   ```
4. Log in using any generated recruiter email (e.g., `demo+google@careernest.test`) with the configured password.

---

## 8. Future Scope

The following enhancements are identified for future development iterations:

| Category | Future Enhancement | Description |
| :--- | :--- | :--- |
| **Generative AI** | **LLM-Powered Resume Rewriting** | Integrate OpenAI GPT-4o or Google Gemini API to rewrite weak resume bullet points in context rather than relying on deterministic templates. |
| **Generative AI** | **Adaptive Audio/Video Mock Interviews** | Introduce real-time voice synthesis and speech-to-text to simulate verbal interview dialogues with dynamic follow-up questions. |
| **Real-Time Comms** | **WebSocket Notifications & Chat** | Implement Socket.io for instantaneous alerts when recruiters update application stages, schedule interviews, or extend job offers. |
| **Calendar Sync** | **Automated Calendar Integrations** | Integrate Google Calendar and Microsoft Outlook APIs to automatically generate `.ics` invites for scheduled interviews. |
| **Mobile Platforms** | **Native Mobile Application** | Develop a dedicated cross-platform mobile app using React Native to support push notifications and mobile-first job discovery. |
| **Enterprise Ops** | **Multi-Tenant University Portal** | Add dedicated placement officer dashboards to track college-wide placement statistics, company drives, and student offer acceptance ratios. |

---

## 9. AWS Deployment Guide

This section outlines the production cloud deployment strategy designed to host CareerNest on Amazon Web Services using **Amazon EC2**, **Amazon RDS (PostgreSQL)**, and **Amazon S3**.

### Target Architecture Overview
- **Amazon EC2:** Hosts an **Amazon Linux 2023** instance running an **Nginx** reverse proxy and the **Node.js Express API** managed by **PM2**.
- **Amazon RDS (PostgreSQL):** Provides a managed, private relational database in a dedicated Virtual Private Cloud (VPC) subnet with automated daily backups.
- **Amazon S3 & CloudFront:** Hosts the static React Single Page Application via CloudFront with **Origin Access Control (OAC)**, and provides private, secure object storage for candidate resumes and company logos.

### Architecture Diagram (AWS Production Target)

```mermaid
flowchart TD
    subgraph PublicInternet ["Public Internet"]
        UserBrowser["Candidate / Recruiter Web Browser"]
    end

    subgraph AWSCloud ["Amazon Web Services (AWS Region)"]
        subgraph EdgeLayer ["Edge & CDN Distribution"]
            CF["Amazon CloudFront CDN (HTTPS)"]
            ACM["AWS Certificate Manager (TLS/SSL)"]
            ACM -.-> CF
        end

        subgraph S3Storage ["Amazon S3 Object Storage"]
            S3Frontend[("S3 Bucket: Frontend Assets<br/>(Private - OAC Restricted)")]
            S3Uploads[("S3 Bucket: Resumes & Logos<br/>(Private - IAM Restricted)")]
        end

        subgraph VPC ["Amazon VPC (Virtual Private Cloud)"]
            subgraph PublicSubnet ["Public Subnet"]
                EC2["Amazon EC2 Instance (Amazon Linux 2023)<br/>• Nginx Reverse Proxy (Ports 80/443)<br/>• Node.js API Service (PM2 - Port 5000)"]
            end

            subgraph PrivateSubnet ["Private DB Subnets (Multi-AZ)"]
                RDS[("Amazon RDS (PostgreSQL Engine)<br/>• Port 5432 Inbound (EC2 SG Only)<br/>• Automated Snapshots & Backups")]
            end
        end

        IAMRole["IAM Role: S3 Upload Adapter Policy"]
        IAMRole -.-> EC2
    end

    UserBrowser -->|HTTPS Request: app.example.com| CF
    CF -->|Fetch Static Bundle via OAC| S3Frontend
    UserBrowser -->|HTTPS API Calls: api.example.com| EC2
    EC2 -->|SQL Queries (Prisma / Drizzle ORM)| RDS
    EC2 -->|PutObject / GetObject Presigned URLs| S3Uploads
```

---

### Database Migration Considerations (MongoDB to RDS PostgreSQL)

> [!CAUTION]
> **Code Changes Required for Amazon RDS PostgreSQL:**  
> The existing application is built on MongoDB using Mongoose. Amazon RDS is a relational database service that does **not** host MongoDB databases. To deploy against Amazon RDS PostgreSQL, complete the following engineering prerequisites before configuring RDS:

1. **Relational Schema Definition:**
   - Map Mongoose document schemas (`User`, `Company`, `Job`, `Application`, `Event`, `Resume`, `Interview`) into SQL tables.
   - Replace MongoDB `ObjectId` strings with PostgreSQL `UUID` or `BIGSERIAL` primary and foreign keys.
   - Convert embedded arrays (e.g., `Job.requirements`, `Application.stageHistory`) into normalized relational tables or PostgreSQL `JSONB` columns.
2. **Data Layer Replacement:**
   - Replace Mongoose queries (`.find()`, `.populate()`, `.findByIdAndUpdate()`) with a TypeScript/Node.js ORM such as **Prisma**, **Drizzle**, or **TypeORM**.
   - Update `Backend/utils/db.js` to establish connection pooling with `pg` / `DATABASE_URL`.
3. **Data Migration Pipeline:**
   - Write an ETL script to dump existing MongoDB JSON records and transform them into relational SQL `INSERT` statements with foreign key integrity.

*(If you wish to deploy the existing codebase to AWS without rewriting the database layer, use an **Amazon EC2** instance connected to **MongoDB Atlas**, with the Atlas connection string supplied in `MONGO_URI`).*

---

### Step-by-Step EC2, RDS, and S3 Deployment

#### Step 1: Provision the S3 Buckets and CloudFront Distribution
1. **Frontend Static Bucket:**
   - In the S3 Console, create a bucket named `careernest-frontend-prod`.
   - Enable **Block all public access** and enable **Bucket Key encryption**.
   - Build the frontend locally with production API URLs:
     ```bash
     cd Frontend
     npm ci
     npm run build
     ```
   - Upload the files inside `Frontend/dist/` (including `index.html` and the `assets/` folder) directly to the bucket root.
2. **CloudFront CDN Distribution:**
   - Create a CloudFront distribution pointing to `careernest-frontend-prod.s3.amazonaws.com`.
   - Select **Origin Access Control (OAC)** and attach the generated S3 bucket policy.
   - Set **Default Root Object** to `index.html`.
   - Under **Custom Error Responses**, map error codes `403` and `404` to `/index.html` with HTTP Status `200 OK` (required for React Router SPA navigation).
3. **Uploads Private Bucket:**
   - Create a bucket named `careernest-uploads-prod`.
   - Enable **Block all public access**.
   - Keep this bucket private; configure authenticated backend routes to serve uploaded files or issue short-lived AWS S3 Presigned URLs.

#### Step 2: Provision Amazon RDS PostgreSQL
1. Open the **Amazon RDS Console** $\rightarrow$ **Databases** $\rightarrow$ **Create database**.
2. Select **Standard create**, choose **PostgreSQL** (version 16 or newer).
3. Select **Free Tier** or **Production** template according to your infrastructure budget.
4. Set DB instance identifier to `careernest-db`, choose master username `postgres`, and set a strong master password.
5. In **Connectivity**, attach the database to your custom VPC, choose **Public access: No**, and create a DB Subnet Group across two Availability Zones.
6. Create a Security Group named `careernest-rds-sg` allowing inbound TCP on port `5432` restricted **exclusively** to the EC2 security group.

#### Step 3: Launch and Configure Amazon Linux 2023 on EC2
1. Open **EC2 Console** $\rightarrow$ **Launch instance**.
2. Choose **Amazon Linux 2023 AMI**, instance type `t3.small` or `t3.micro`.
3. Select an SSH key pair.
4. Configure Security Group `careernest-ec2-sg`:
   - Inbound `80` (HTTP) from `0.0.0.0/0`.
   - Inbound `443` (HTTPS) from `0.0.0.0/0`.
   - Inbound `22` (SSH) restricted to your administrative IP address.
5. Create an **IAM Role** with an inline policy granting `s3:PutObject`, `s3:GetObject`, and `s3:DeleteObject` on `arn:aws:s3:::careernest-uploads-prod/*` and attach it to the EC2 instance.

#### Step 4: Install Dependencies & Setup App on EC2
Connect to your EC2 instance via SSH:

```bash
sudo dnf update -y
sudo dnf install -y git nginx

# Install Node.js 22 LTS via NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install 22
nvm use 22

# Clone the repository
git clone https://github.com/shrrya19/Job-Portal-AWS.git
cd Job-Portal-AWS/Backend
npm ci
```

Configure the production environment file `Backend/.env`:

```dotenv
NODE_ENV=production
PORT=5000
SECRET_KEY=use_a_cryptographically_generated_secret_string
FRONTEND_URL=https://app.example.com
BACKEND_URL=https://api.example.com
COOKIE_SAME_SITE=none

# For Migrated RDS PostgreSQL:
DATABASE_URL=postgresql://postgres:YourMasterPassword@careernest-db.xxxxxx.region.rds.amazonaws.com:5432/careernest?sslmode=require

# S3 Uploads Bucket Configuration
AWS_REGION=ap-south-1
AWS_S3_BUCKET_UPLOADS=careernest-uploads-prod
```

Start the application with PM2:

```bash
sudo npm install -g pm2
pm2 start index.js --name careernest-api
pm2 save
pm2 startup systemd
```
*(Execute the systemd command generated by PM2 to enable auto-restart on instance reboot).*

---

### Nginx Reverse Proxy & SSL Configuration

Configure Nginx as a reverse proxy on EC2 to terminate SSL and route incoming web traffic to the Express API running on port 5000.

Create `/etc/nginx/conf.d/careernest-api.conf`:

```nginx
server {
    listen 80;
    server_name api.example.com;

    # Redirect all HTTP requests to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.example.com;

    # SSL Certificates (managed via Certbot / Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/api.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.example.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    client_max_body_size 10M;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Verify and restart Nginx:
```bash
sudo nginx -t
sudo systemctl enable --now nginx
sudo systemctl reload nginx
```

Install Certbot for automated SSL certificate issuance:
```bash
sudo dnf install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.example.com
```

---

### Security Groups & IAM Roles Configuration

| Security Group | Inbound Rules | Outbound Rules | Purpose |
| :--- | :--- | :--- | :--- |
| **`careernest-ec2-sg`** | • TCP 80 from `0.0.0.0/0`<br/>• TCP 443 from `0.0.0.0/0`<br/>• TCP 22 from Admin IP | • All traffic to `0.0.0.0/0` | Protects EC2 host; allows web traffic and outbound package updates |
| **`careernest-rds-sg`** | • TCP 5432 restricted to `careernest-ec2-sg` | • None | Isolates database completely from the public internet |

**IAM Instance Policy (`CareerNest-EC2-S3-Policy`):**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowUploadsAccess",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::careernest-uploads-prod/*"
    }
  ]
}
```

---

## 10. Documentation & Audit Quality

### Audit Summary & Technical Review
This documentation reflects the actual verified state of the CareerNest codebase:
- **No Mock Test Data in Production:** Demonstrations reflect actual code pathways (`pdf-parse`, `mammoth`, `atsAnalyzer.js`, `demoInterviewEngine.js`).
- **Data Integrity:** All 7 Mongoose schemas, Express controllers, Redux slices, and UI components were inspected before compiling this guide.
- **Security Compliance:** Credentials, JWT signing keys, and cloud secrets are kept exclusively in local `.env` configurations and are never hardcoded.

### Licensing & Authorship
- **Application Name:** CareerNest (Student Job Portal)
- **Engineered for:** Academic Project Evaluation, Technical Demonstrations, and Cloud Production Deployment.
- **License:** ISC License. Open for academic evaluation and portfolio presentation.
