import express from "express";
import { register, login, logout, updateProfile, saveJob, getSavedJobs } from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import authorizeRole from "../middlewares/authorizeRole.js";
import { singleUpload } from "../middlewares/multer.js";

const router = express.Router();

router.route("/register").post(singleUpload, register);
router.route("/login").post(login);
router.route("/logout").post(logout);
router.route("/profile/update").post(isAuthenticated, singleUpload, updateProfile);
router.route("/savejob/:jobId").post(isAuthenticated, authorizeRole("student"), saveJob);
router.route("/savedjobs").get(isAuthenticated, authorizeRole("student"), getSavedJobs);

export default router;  