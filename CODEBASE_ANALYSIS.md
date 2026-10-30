# Job Portal Codebase Analysis

Review date: 2026-10-23

## Scope and confidence

This is a source-level review of the first-party frontend and backend, configuration, package manifests, and the supplied README. The production frontend build, frontend lint command, backend JavaScript syntax checks, dependency advisory checks, and package-version checks were run. No database-backed or browser-interactive workflow was claimed as tested: the MongoDB/Cloudinary credentials were not inspected or disclosed, and no live service connection was verified.

The requested new features are not implemented in this review. This report is the Phase 1 deliverable and proposed Phase 2 work order.

## Architecture and technology

- **Frontend:** React 18 and Vite 8; React Router 7; Redux Toolkit with `redux-persist`; Axios; Tailwind CSS 4; Radix/shadcn-style UI components; Framer Motion. Entry points and routing are in `Frontend/src/main.jsx` and `Frontend/src/App.jsx`.
- **Backend:** Node.js ES modules and Express 5. Routes are mounted in `Backend/index.js`; endpoint handlers are organized under `Backend/routes/` and `Backend/controllers/`.
- **Database:** MongoDB through Mongoose. Models cover users, companies, jobs, applications, and events in `Backend/models/`.
- **Authentication:** bcryptjs password hashing, JWTs in an HTTP-only cookie, and `isAuthenticated` middleware. The frontend also persists Redux state in browser local storage.
- **Uploads and external services:** Multer memory storage, Data URI conversion, and Cloudinary uploads for profile photos, resumes, and company logos.
- **Frontend/backend communication:** Axios requests target hard-coded `http://localhost:5000/api/v1/...` constants; the backend permits credentialed requests from `http://localhost:5173`.
- **Main API groups:** `/api/v1/user`, `/api/v1/company`, `/api/v1/job`, `/api/v1/application`, and `/api/v1/event`. There is no API documentation route or test suite.
- **Repository layout:** The root contains `README.md` and separate `Backend/` and `Frontend/` packages. The backend has controllers, models, routes, middleware, and utilities. The frontend has route-level components, shared/UI components, hooks, and Redux slices. Each package has its own lockfile and dependencies; there is no root package manifest.

## Existing functionality and implementation status

| Area | Source evidence | Status from inspection |
|---|---|---|
| Student/recruiter registration and login | `Backend/controllers/user.controller.js`, `Frontend/src/components/auth/` | Present. Role is selected in the UI and stored in the user model; server-side authorization is not consistently enforced on the rest of the API. |
| Job browsing, text search, and details | `Frontend/src/components/Jobs.jsx`, `JobDescription.jsx`; `Backend/controllers/job.controller.js` | Present, but search/filter behavior is incomplete and the data is fetched without pagination. |
| Job posting and company management | `Frontend/src/components/admin/`; company/job controllers | Present for recruiter-facing screens; server checks do not verify recruiter role or company ownership. |
| Job applications and status | Application routes/controller, `AppliedJobTable.jsx`, `ApplicantsTable.jsx` | Present in a basic form: apply, list personal applications, and accept/reject. Status management lacks ownership authorization and the UI does not refresh the changed row. |
| Saved jobs | User controller/routes, `SavedJobs.jsx`, `Job.jsx` | Save and list operations exist. An unsave operation is not implemented. |
| Profile and resume | User model/controller, `Profile.jsx`, `UpdateProfileDialog.jsx` | Basic editable profile, skills, photo, and resume link are present. File constraints, secure document lifecycle, and richer portfolio fields are absent. |
| Events | Event model/controller/routes and public event components | Public listing/details/external registration link exist. Search and filters are not connected to the list. Admin event management is unfinished and event mutation APIs are unauthenticated. |
| Student/recruiter dashboards | Home, profile, recruiter company/jobs pages | No complete student or recruiter dashboard. Existing profile and job-management pages provide some dashboard-like functions. |
| AI/career guidance | No implementation found; some marketing language occurs in the footer | Not implemented. Marketing copy is not evidence of a working integration. |

## Critical issues and root causes

### P0 — Resolve before exposing the application beyond local development

1. **Server authorization does not match UI roles or ownership.** `isAuthenticated` only verifies a token. Job posting, company update, applicant listing, and application status update do not verify recruiter role or resource ownership. All event create/update/delete routes are public. A frontend route guard is not a server-side access control. Relevant files: `Backend/middlewares/isAuthenticated.js`, `Backend/routes/{job,company,application,event}.route.js`, and the corresponding controllers.
2. **The checked-in local environment key names do not include `SECRET_KEY`.** Login signs JWTs and middleware verifies them with this variable. If it is not provided through the process environment, authentication requests fail. Only variable names were inspected; no values are reproduced here.
3. **Database connection failures are swallowed.** `Backend/utils/db.js` catches connection errors without rethrowing, so `Backend/index.js` can proceed to `app.listen()` after a failed MongoDB connection. This contradicts the startup flow’s intended “connect first” behavior and gives a misleading running-server state.
4. **Dependency advisory exposure needs remediation.** `npm audit --omit=dev` reported 11 backend runtime dependency advisories (1 critical, 7 high, 2 moderate, 1 low) and 28 frontend runtime dependency advisories (1 critical, 21 high, 5 moderate, 1 low). These results are registry/advisory snapshots for the installed lockfiles; they do not prove every advisory is reachable in application use. Do not apply `npm audit fix --force` blindly because it may introduce breaking changes.

### P1 — Fix to restore reliable core workflows

5. **Some application API failures can leave requests hanging.** `applyJob`, `getAppliedJobs`, `getApplicants`, and `updateStatus` only log caught errors and do not send an HTTP response. Invalid data and database failures can therefore leave clients waiting rather than returning an explicit error.
6. **Company updates fail when no logo file is uploaded.** The controller unconditionally builds a Data URI from `req.file`, while the UI makes the logo optional.
7. **The job filters are not real filters.** `FilterCard` has a misspelled `vlaue` prop; a selected location, role, or salary label is passed into a single broad search-query field, and matching only considers title, description, and location. Salary ranges and employment type are not filtered. The job hook fetches only once and does not refetch when its search query changes.
8. **Event search and filters are inert.** `EventSearch` and `EventFilter` keep component-local state, but neither state is applied in `EventList`; the list renders every event from Redux unchanged.
9. **Event administration is not usable end-to-end.** `AdminEvents` is not registered in the router; its table import refers to a missing `AdminEventsTable` module, while `EventTable.jsx`, `PostEvent.jsx`, and `UpdateEvent.jsx` are empty. The admin-events hook calls `/event/admin`, which has no matching backend route. The create/update/delete controller functions exist but are not protected.
10. **Registration/login email handling differs.** Registration trims and lowercases email; login searches with the supplied value without normalizing it, so case or whitespace differences can prevent valid logins.
11. **JWT cookie settings are development-only.** The cookie hardcodes `secure: false`; production must use environment-appropriate secure cookie settings and deployment-aware CORS/origin configuration.
12. **Uploads lack server-side bounds/type checks.** Multer memory storage has no file size or MIME/type restrictions before profile, resume, and logo contents are sent to Cloudinary. This creates avoidable resource and content-handling risk.
13. **Several route/data checks are too permissive or incomplete.** Recruiters can post jobs against arbitrary company IDs; job/application status values rely mostly on model casting; event updates/deletes do not distinguish missing records consistently; application GET is used for a state-changing apply operation.

### P2 — Quality, UX, and maintainability

14. **Frontend lint does not pass.** `npm run lint` reported 76 problems: 68 errors and 8 warnings. Errors are mainly unused React/import declarations and unused symbols; warnings include missing React hook dependencies.
15. **Production bundle is large.** `npm run build` passes, but Vite reports a 1,388.97 kB minified JavaScript chunk (366.08 kB gzip), above its 500 kB warning threshold.
16. **Error/loading UX is inconsistent.** Several hooks/components only log request failures. Event details can remain on a loading view after a failed request. Authentication-persisted UI state can outlive an expired server token.
17. **Accessibility and responsive navigation need a focused pass.** Navigation items are hidden below the medium breakpoint and the inspected navbar has no evident mobile menu interaction; interactive clickable containers and visual-only status/action patterns should be checked for keyboard support and semantics.
18. **The README is not a reliable setup guide.** It uses lowercase `frontend`/`backend` paths despite the actual `Frontend/` and `Backend/` directory names, omits environment setup and database/service instructions, presents commands in a misleading order, and has incomplete Markdown fencing.
19. **No meaningful automated tests are configured.** The backend `test` script intentionally exits with “no test specified.” The frontend manifest has build/lint scripts but no test script.
20. **Package updates are available.** `npm outdated` showed updates for multiple backend and frontend packages. For example, backend Express, Mongoose, Multer, Cloudinary, and frontend Vite, Axios, React Router, Tailwind, and icon/UI packages have newer versions. Upgrade in reviewed, tested batches; do not treat “latest” as automatically compatible.

## Proposed bug-fix order

1. Validate required server configuration at startup; make MongoDB connection errors fail startup; normalize and validate authentication input.
2. Implement server-side role, ownership, and resource authorization for job, company, application, and event operations before relying on recruiter/student UI separation.
3. Add explicit validation and response handling to all controller error paths; validate application status and job/event payloads; change the apply operation to an appropriate state-changing HTTP method.
4. Add upload size/type limits and correct optional logo handling; confirm Cloudinary configuration and privacy/retention behavior.
5. Repair job and event search/filter state flow and make job employment-type filtering match model data.
6. Either complete and route the event administration workflow (including its list API and protected ownership checks) or keep the unfinished pages out of navigation until they are functional.
7. Improve loading/error/empty states, fix lint findings, then add focused API/component tests for authentication, role checks, and core job/application workflows.
8. Update documentation with the actual Windows setup and environment variable reference once the intended deployment configuration is settled.

## Verified checks and limitations

- **Frontend build:** Passed with Vite; emitted a large-chunk warning noted above.
- **Frontend lint:** Failed with 68 errors and 8 warnings.
- **Backend JavaScript syntax:** `node --check` passed for backend source files.
- **Backend test script:** No test suite is configured.
- **Dependency audit:** Runtime dependency checks found the advisory counts above. Dev-only dependencies were not covered by the `--omit=dev` audit.
- **Dependency freshness:** `npm outdated` reported package updates in both packages; no package files or lockfiles were modified.
- **Not verified:** Live backend startup, MongoDB queries, Cloudinary uploads, browser console behavior, registration/login, role denial, application lifecycle, and responsive rendering. These require valid local service configuration and/or an interactive browser run.
- **Configuration names found (values intentionally not shown):** `MONGO_URI`, `PORT`, `CLOUD_NAME`, `API_KEY`, and `API_SECRET`. `SECRET_KEY` was not among the keys in the inspected backend `.env` file.

## Phase 4: 30-feature backlog

Status labels describe source-level implementation, not live end-to-end verification. No external AI provider or paid service has been selected.

### A. AI-powered career tools

1. **ATS-friendly resume analyzer — Missing.** Benefit: actionable resume/job-description alignment feedback. Frontend: upload, job-description input, results and retention controls. Backend/database: secure text extraction, analysis endpoint and optional report history. External service: optional AI/model; PDF/DOCX parsing libraries needed. **Complexity: Hard.** Depends on resume upload validation/privacy.
2. **Skill gap analyzer — Missing.** Benefit: show required skills versus a student’s profile. Frontend: target role and comparison view. Backend/database: skill matching endpoint and optional saved analysis. External service: none for deterministic MVP; AI optional. **Complexity: Medium.** Depends on a consistent skill vocabulary and job requirements.
3. **AI career guidance chatbot — Missing.** Benefit: conversational career preparation guidance. Frontend: chat interface/history. Backend/database: protected chat endpoint and optional conversation records. External service: AI API and, for current facts, trusted retrieval source. **Complexity: Hard.** Depends on privacy and prompt/data policy.
4. **Job-description-based mock interview — Missing.** Benefit: role-relevant practice. Frontend: JD entry, question flow, response capture. Backend/database: generation/evaluation APIs and optional session history. External service: AI API. **Complexity: Hard.** Depends on job description parsing and answer evaluator.
5. **AI career roadmap generator — Missing.** Benefit: compare realistic job/study paths. Frontend: guided profile questionnaire and roadmap display. Backend/database: generation endpoint and optional saved paths. External service: AI optional; factual course/career source recommended. **Complexity: Hard.** Depends on user education/goals data and source validation.
6. **AI resume builder — Missing.** Benefit: create resumes from profile data. Frontend: editor/templates/export. Backend/database: resume draft storage and export endpoint. External service: none required; PDF generation library. **Complexity: Hard.** Depends on a richer student profile and document privacy.
7. **Interview answer evaluator — Missing.** Benefit: structured practice feedback. Frontend: answer capture and rubric-based feedback. Backend/database: evaluation endpoint and optional history. External service: AI API or carefully defined rubric engine. **Complexity: Medium.** Depends on mock interview question flow.
8. **Personalized learning recommendations — Missing.** Benefit: targeted learning suggestions. Frontend: recommended learning list/progress controls. Backend/database: skill-to-resource mapping and progress persistence. External service: none for curated MVP; course catalog API optional. **Complexity: Medium.** Depends on skill gaps and a verified resource catalog.
9. **Job-description summarizer — Missing.** Benefit: quickly understand responsibilities/requirements. Frontend: summary panel on job details. Backend/database: summarization endpoint; no persistence required initially. External service: AI API or local NLP. **Complexity: Medium.** Depends on job detail text.
10. **Career path comparison tool — Missing.** Benefit: compare preparation and qualification tradeoffs. Frontend: side-by-side path view. Backend/database: path comparison endpoint/data source. External service: curated source or AI API. **Complexity: Hard.** Depends on roadmap and higher-education data.

### B. Student experience

11. **Personalized job recommendations — Missing.** Benefit: surface relevant roles for each student. Frontend: recommendation section and preference controls. Backend/database: profile/job matching and ranking. External service: none required. **Complexity: Medium.** Depends on reliable profile skills/preferences and job metadata.
12. **Internship discovery portal — Partial.** Job schema accepts `Internship`, but it is mixed into the general jobs feed without a dedicated portal/filter. Frontend: dedicated section and filters. Backend/database: ensure internship listing semantics and filters. External service: none. **Complexity: Easy.** Depends on functional employment-type filtering.
13. **Apprenticeship discovery portal — Missing.** Frontend: dedicated listing/discovery. Backend/database: add opportunity type and validation, query/filter support. External service: none. **Complexity: Medium.** Depends on opportunity model/category design.
14. **Full-time and part-time job filters — Partial.** The schema supports both, but the existing filter UI does not apply employment type. Frontend: working filter controls. Backend/database: query parameters and indexes only if needed. External service: none. **Complexity: Easy.** Depends on search/filter repair.
15. **Saved jobs and application tracker — Partial.** Save/list and application status display exist; unsave and robust refresh/status flow are absent. Frontend: remove saved item and synchronize status. Backend/database: unsave endpoint and status consistency. External service: none. **Complexity: Easy.** Depends on existing user/job/application APIs.
16. **Application deadline alerts — Missing.** No job deadline field or notifications exist. Frontend: alert preferences and notification display. Backend/database: deadline field, scheduled checks, delivery records. External service: email/push provider optional. **Complexity: Medium.** Depends on notification infrastructure and job expiry rules.
17. **Student skill portfolio — Partial.** Profile stores skills and resume only. Frontend: certification/project/achievement/work-sample sections. Backend/database: profile schema and validation updates. External service: Cloudinary or equivalent for files. **Complexity: Medium.** Depends on profile editing and upload controls.
18. **Career roadmaps by qualification — Missing.** Frontend: qualification-specific roadmap pages. Backend/database: curated roadmap content or query endpoint. External service: none for curated content. **Complexity: Medium.** Depends on content validation and career roadmap design.
19. **Higher education guidance — Missing.** Frontend: course/specialization comparisons. Backend/database: course/eligibility catalog. External service: verified education data source recommended, but not mandatory for a curated MVP. **Complexity: Medium.** Depends on qualification profile and maintained content.
20. **Learning progress dashboard — Missing.** Frontend: goals, milestones, progress view. Backend/database: learning activity and progress records. External service: none for internal tracking. **Complexity: Medium.** Depends on learning recommendations/catalog.

### C. Recruiter experience

21. **Dedicated recruiter dashboard — Partial.** Company, jobs, and applicants pages exist but not a single activity dashboard. Frontend: summary/work queue. Backend/database: aggregated recruiter-owned metrics. External service: none. **Complexity: Medium.** Depends on server-side ownership authorization.
22. **Applicant filtering and shortlisting — Partial.** Applicants can be listed and marked accepted/rejected; skill/qualification/experience filters are absent. Frontend: filters and shortlist state. Backend/database: query support and shortlist fields/status rules. External service: none. **Complexity: Medium.** Depends on richer applicant profiles and authorization.
23. **Recruiter ATS dashboard — Partial.** Application states are only pending/accepted/rejected, not a configurable review pipeline. Frontend: stage board/table. Backend/database: stage model and transition validation. External service: none. **Complexity: Medium.** Depends on applicant workflow and status migration plan.
24. **Interview scheduling system — Missing.** Frontend: scheduling and candidate response flow. Backend/database: interview records, time zones, notifications. External service: calendar/email integration optional. **Complexity: Hard.** Depends on recruiter authorization and notifications.
25. **Bulk resume review — Missing.** Applicant rows link to individual resumes only. Frontend: controlled batch review interface. Backend/database: authorized bulk query/download strategy and audit/privacy controls. External service: none required. **Complexity: Medium.** Depends on secure document storage and recruiter ownership checks.
26. **Recruiter analytics dashboard — Missing.** No actual hiring funnel analytics. Frontend: metrics and charts. Backend/database: aggregates for owned postings/applications. External service: none. **Complexity: Medium.** Depends on consistent application statuses and event tracking.

### D. Platform and productivity

27. **Notifications center — Missing.** No notification model, API, or interface. Frontend: inbox/read state. Backend/database: notification records and delivery triggers. External service: email/push optional. **Complexity: Medium.** Depends on application/interview events.
28. **Advanced search and filters — Partial.** Basic keyword search and filter UI exist, but controls are not wired into complete role/company/location/skill/salary/experience/employment queries. Frontend: filter state and results UX. Backend/database: validated query params, indexes, pagination/sorting. External service: none. **Complexity: Medium.** Depends on opportunity data model and filter repair.
29. **Admin dashboard — Missing.** Existing recruiter pages are not platform administration. Frontend: protected admin panel. Backend/database: separate admin identity/role and management APIs/audit log. External service: none. **Complexity: Hard.** Depends on an explicit admin authorization model.
30. **Resume and profile document management — Partial.** Resume upload and viewing links exist; replacement/removal, type/size validation, and lifecycle controls are absent. Frontend: document manager. Backend/database: metadata/lifecycle endpoints and access policies. External service: current Cloudinary integration may be reused after review. **Complexity: Medium.** Depends on secure upload limits, access control, and retention policy.

## Recommended next step

First address the P0 authentication/authorization/configuration defects and confirm local startup. Then repair P1 core workflows and add regression tests. Select any Phase 4 features you want after the foundations are safe; avoid beginning AI or larger UI work until you have chosen a scope and any required paid/external services.

## Implementation plan after feature selection

Selected: features **1–9 and 12–30**. Not selected: **10 Career path comparison tool** and **11 Personalized job recommendations**. No AI provider or admin provisioning process has been authorized yet.

### Stage 1 — Security and core API foundations

Work in `Backend/middlewares/`, `Backend/routes/`, `Backend/controllers/`, `Backend/models/`, and the corresponding frontend API callers:

- Load the authenticated user’s current role from the database, enforce role gates, and verify the owner of every recruiter-managed resource.
- Ensure missing `SECRET_KEY`/`MONGO_URI` or failed MongoDB startup prevents the server from listening.
- Validate request data and file size/type; return explicit errors rather than leaving requests pending.
- Keep registration from assigning an administrator role; provide an administrator provisioning method only after the choice below.
- Add backend tests for role denial and owner checks before building recruiter/admin data views.

### Stage 2 — Opportunity model and discovery

Update `Backend/models/job.model.js`, `Backend/controllers/job.controller.js`, job routes, `Frontend/src/components/Jobs.jsx`, `FilterCard.jsx`, `PostJob.jsx`, job hooks, and Redux state:

- Add distinct `opportunityType` (`job`, `internship`, `apprenticeship`) and `employmentType` fields while retaining existing `jobType` data during transition.
- Provide additive migration logic that maps existing `jobType: Internship` records to internship opportunities and maps existing full-/part-time/contract entries to employment type. Preserve original fields; back up and inspect existing data before executing any database migration.
- Add validated search/filter/sort/pagination parameters and dedicated Jobs, Internships, and Apprenticeships discovery experiences. Filters should use actual structured fields, not a keyword field.
- Ensure job posting requires recruiter-owned companies and validates salary, experience, opportunity type, and employment type.

### Stage 3 — Student profile and productivity

Update user/profile models and APIs, `Profile.jsx`, `UpdateProfileDialog.jsx`, `SavedJobs.jsx`, `AppliedJobTable.jsx`, and add student-facing pages/components:

- Extend profile data additively for education/qualification, projects, certifications, achievements, and work samples.
- Complete saved-job removal and application status refresh; expand statuses only when the recruiter workflow is ready.
- Add job application deadlines and in-app notifications for deadline and application-status events. This MVP does not require an email/push vendor.
- Add curated qualification roadmaps and education guidance with source attribution; add learning-resource and progress records with student-owned access control.

### Stage 4 — Recruiter workflows

Update application/job models and recruiter pages under `Frontend/src/components/admin/`; add interview/notification models and protected APIs:

- Build an owned-data recruiter dashboard with posting/application metrics.
- Add applicant filters and a validated ATS stage pipeline, keeping applicant records private to the job-owning recruiter.
- Add interview schedules, candidate-facing notifications, and in-app interview details. Calendar/email delivery is out of scope until a provider is explicitly chosen.
- Add bulk resume review only through server-authorized records, without public resume URLs or cross-recruiter access.
- Complete event administration routes/UI only after current role/ownership protections are covered by tests.

### Stage 5 — AI features (provider decision required)

Add a backend AI service layer and protected APIs; do not put provider keys in frontend code or commit them. Candidate endpoint families: resume analysis, skill-gap comparison, career chat, mock-interview question generation, career-roadmap generation, resume drafting, answer evaluation, learning recommendations, and job-description summaries. Add explicit per-action consent, bounded upload/text sizes, privacy/retention controls, provider timeouts, and transparent results. AI output must be described as guidance, not guaranteed ATS scoring, hiring, salary, admission, or outcomes.

The selected resume analyzer and mock-interview/answer-evaluation flows may transmit resumes, job descriptions, and practice answers to a third-party AI provider if one is chosen. No provider is selected in this plan. A local-model option requires a running local inference service and should fail clearly when unavailable; it must not silently return fabricated results.

### Stage 6 — UI redesign, documentation, and verification

Apply a shared compact/accessibility-aware system across `Frontend/src/App.css`, `index.css`, shared navigation, auth, student pages, recruiter pages, and forms. Keep pages and controls limited to working functionality. Update the root README and add only focused setup/API documentation where needed. Run frontend build/lint, backend syntax/tests, and scenario tests for student/recruiter/admin access; verify responsive layouts in a browser. Do not claim MongoDB, Cloudinary, email, calendar, or AI workflows passed without the corresponding service test.

### Unresolved decisions

1. **AI provider and data sharing:** choose a provider or local model, and confirm whether resumes, job descriptions, and practice answers may be sent to it. API key values should be configured locally through environment variables and never pasted into chat.
2. **Administrator provisioning:** preferred secure default is a one-time backend CLI command that creates/promotes an administrator without public self-registration. Alternative is an explicit environment-based allowlist. Neither is implemented until selected.

## Registration failure follow-up

The signup page was opened from `http://127.0.0.1:5173`. At that time the backend exited before listening because `SECRET_KEY` was absent from `Backend/.env`, so the signup request could not reach the registration route. The backend CORS setting also allowed `http://localhost:5173` by default, not the browser's `127.0.0.1` origin.

The startup gate was moved to login/protected-request handling because registration does not create a JWT. Missing `SECRET_KEY` now produces a clear 503 on login and protected routes instead of preventing account registration from starting. CORS now accepts both local Vite hostnames and configured comma-separated `FRONTEND_URL` origins. Signup lets the browser/Axios create the multipart boundary and shows a specific connection message when the backend cannot be reached.

Verification: backend now connects to MongoDB and listens on port 5000; a browser-origin multipart request reached `/api/v1/user/register` and received the expected 400 validation response for missing fields. This verifies startup, CORS, multipart parsing, and field validation without creating a test account. A full successful account creation and subsequent login were not tested; login requires a `SECRET_KEY` to be configured.
