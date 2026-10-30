import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import authorizeRole from "../middlewares/authorizeRole.js";
import { getCompany, getCompanyById, registerCompany, updateCompany } from "../controllers/company.controller.js";
import { singleUpload } from "../middlewares/multer.js"

const router = express.Router();

router.route("/register").post(isAuthenticated, authorizeRole("recruiter"), registerCompany);
router.route("/get").get(isAuthenticated, authorizeRole("recruiter"), getCompany);
router.route("/get/:id").get(isAuthenticated, authorizeRole("recruiter"), getCompanyById);
router.route("/update/:id").put(isAuthenticated, authorizeRole("recruiter"), singleUpload, updateCompany);

export default router;  