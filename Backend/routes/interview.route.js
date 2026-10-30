import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import authorizeRole from "../middlewares/authorizeRole.js";
import {
  getEligibleJobs,
  getJobPreparationInfo,
  scheduleInterview,
  getMyInterviews,
  getInterviewById,
  startInterview,
  saveAnswer,
  submitInterview,
  rescheduleInterview,
  cancelInterview,
} from "../controllers/interview.controller.js";

const router = express.Router();

// Retrieve jobs available to student (applied, saved, or active)
router.route("/eligible-jobs").get(isAuthenticated, authorizeRole("student"), getEligibleJobs);

// Retrieve job details & preview tailored questions
router.route("/job/:jobId/prepare").get(isAuthenticated, authorizeRole("student"), getJobPreparationInfo);

// Schedule a new demo interview
router.route("/schedule").post(isAuthenticated, authorizeRole("student"), scheduleInterview);

// Retrieve student's interviews & dashboard statistics
router.route("/my-interviews").get(isAuthenticated, authorizeRole("student"), getMyInterviews);

// Retrieve single interview details
router.route("/:id").get(isAuthenticated, authorizeRole("student"), getInterviewById);

// Start an interview session
router.route("/:id/start").post(isAuthenticated, authorizeRole("student"), startInterview);

// Save student answer for a question in real-time
router.route("/:id/save-answer").put(isAuthenticated, authorizeRole("student"), saveAnswer);

// Submit interview and generate evaluation feedback
router.route("/:id/submit").post(isAuthenticated, authorizeRole("student"), submitInterview);

// Reschedule an interview
router.route("/:id/reschedule").post(isAuthenticated, authorizeRole("student"), rescheduleInterview);

// Cancel an interview
router.route("/:id/cancel").post(isAuthenticated, authorizeRole("student"), cancelInterview);

export default router;

