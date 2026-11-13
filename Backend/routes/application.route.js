import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import authorizeRole from "../middlewares/authorizeRole.js";

import { applyJob, getApplicants, getAppliedJobs, respondToOffer, updateStatus } from "../controllers/application.controller.js";

const router = express.Router();

router.route("/apply/:id").post(isAuthenticated, authorizeRole("student"), applyJob)
router.route("/get").get(isAuthenticated, authorizeRole("student"), getAppliedJobs)
router.route("/:id/applicants").get(isAuthenticated, authorizeRole("recruiter"), getApplicants)
router.route("/status/:id/update").post(isAuthenticated, authorizeRole("recruiter"), updateStatus)
router.route("/status/:id/offer-response").post(isAuthenticated, authorizeRole("student"), respondToOffer)

export default router;