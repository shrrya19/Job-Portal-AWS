import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import authorizeRole from "../middlewares/authorizeRole.js";
import { singleUpload } from "../middlewares/multer.js";
import {
    uploadResume,
    saveResumeDraft,
    getMyResumes,
    getResumeById,
    deleteResume,
    analyzeResumeContent,
    compareJobDescription,
    improveBullet
} from "../controllers/resume.controller.js";

const router = express.Router();

// Resume upload with file parsing & ATS analysis
router.route("/upload").post(isAuthenticated, authorizeRole("student"), singleUpload, uploadResume);

// Resume builder draft creation & update
router.route("/save").post(isAuthenticated, authorizeRole("student"), saveResumeDraft);

// Retrieve authenticated student's resumes
router.route("/my-resumes").get(isAuthenticated, authorizeRole("student"), getMyResumes);

// Retrieve specific resume details
router.route("/:id").get(isAuthenticated, authorizeRole("student"), getResumeById);

// Delete resume
router.route("/:id").delete(isAuthenticated, authorizeRole("student"), deleteResume);

// On-demand ATS analysis
router.route("/analyze").post(isAuthenticated, authorizeRole("student"), analyzeResumeContent);

// Job description comparison
router.route("/compare-job").post(isAuthenticated, authorizeRole("student"), compareJobDescription);

// Suggestion/rewrite helper
router.route("/improve-text").post(isAuthenticated, authorizeRole("student"), improveBullet);

export default router;

