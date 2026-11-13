import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import authorizeRole from "../middlewares/authorizeRole.js";
import { getRecruiterDashboard, rankJobCandidates } from "../controllers/recruiter.controller.js";

const router = express.Router();

router.get("/dashboard", isAuthenticated, authorizeRole("recruiter"), getRecruiterDashboard);
router.get("/jobs/:jobId/candidates", isAuthenticated, authorizeRole("recruiter"), rankJobCandidates);

export default router;
