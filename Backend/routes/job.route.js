import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import authorizeRole from "../middlewares/authorizeRole.js";

import {
    postJob,
    getAllJobs,
    getAdminJobs,
    getAdminJobById,
    getJobById,
    updateJob,
    updateJobStatus,
    deleteJob
} from "../controllers/job.controller.js";

const router = express.Router();

router.route("/post").post(isAuthenticated, authorizeRole("recruiter"), postJob);
router.route("/update/:id").put(isAuthenticated, authorizeRole("recruiter"), updateJob);
router.route("/status/:id").patch(isAuthenticated, authorizeRole("recruiter"), updateJobStatus);
router.route("/delete/:id").delete(isAuthenticated, authorizeRole("recruiter"), deleteJob);
router.route("/get").get(getAllJobs);
router.route("/getadminjobs").get(isAuthenticated, authorizeRole("recruiter"), getAdminJobs);
router.route("/getadmin/:id").get(isAuthenticated, authorizeRole("recruiter"), getAdminJobById);
router.route("/get/:id").get(getJobById);

export default router;