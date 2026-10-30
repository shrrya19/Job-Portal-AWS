import { Company } from "../models/company.model.js";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import { storeImageSecurely } from "../utils/fileStorage.js";

// ✅ Register Company
export const registerCompany = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Company name is required.",
        success: false
      });
    }

    const trimmedName = name.trim();

    // Check if company with same name already exists
    let company = await Company.findOne({ name: { $regex: `^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" } });

    if (company) {
      // If it belongs to current user, return existing company smoothly
      if (company.userId && company.userId.toString() === req.id) {
        return res.status(200).json({
          message: "Company already registered to your account",
          company,
          success: true
        });
      }
      return res.status(400).json({
        message: "A company with this name already exists",
        success: false
      });
    }

    company = await Company.create({
      name: trimmedName,
      userId: req.id
    });

    return res.status(201).json({
      message: "Company registered successfully",
      company,
      success: true
    });

  } catch (error) {
    console.error("REGISTER COMPANY ERROR:", error);
    res.status(500).json({
      message: "Server error",
      success: false
    });
  }
};

// ✅ Get all companies of logged-in user
export const getCompany = async (req, res) => {
  try {
    const userId = req.id;

    const companies = await Company.find({ userId });

    return res.status(200).json({
      companies: companies || [],
      success: true
    });

  } catch (error) {
    console.error("GET COMPANIES ERROR:", error);
    res.status(500).json({
      message: "Server error",
      success: false
    });
  }
};

// ✅ Get company by ID
export const getCompanyById = async (req, res) => {
  try {
    const companyId = req.params.id;

    const company = await Company.findById(companyId);

    if (!company) {
      return res.status(404).json({
        message: "Company not found.",
        success: false
      });
    }

    if (!company.userId) {
      company.userId = req.id;
      await company.save();
    } else if (company.userId.toString() !== req.id) {
      return res.status(403).json({
        message: "You are not authorized to access this company.",
        success: false
      });
    }

    return res.status(200).json({
      company,
      success: true
    });

  } catch (error) {
    console.error("GET COMPANY BY ID ERROR:", error);
    res.status(500).json({
      message: "Server error",
      success: false
    });
  }
};

// ✅ Update Company
export const updateCompany = async (req, res) => {
  try {
    const { name, description, website, location } = req.body;
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        message: "Company not found.",
        success: false
      });
    }

    if (!company.userId) {
      company.userId = req.id;
    } else if (company.userId.toString() !== req.id) {
      return res.status(403).json({
        message: "You are not authorized to update this company.",
        success: false
      });
    }

    if (name !== undefined && name.trim()) company.name = name.trim();
    if (description !== undefined) company.description = description;
    if (website !== undefined) company.website = website;
    if (location !== undefined) company.location = location;

    if (req.file) {
      if (!req.file.mimetype?.startsWith("image/")) {
        return res.status(400).json({
          message: "Company logo must be an image (PNG, JPG, WEBP, SVG).",
          success: false
        });
      }

      try {
        const stored = await storeImageSecurely(req.file, "company_logo", "companies");
        company.logo = stored.fileUrl;
      } catch (uploadErr) {
        console.error("Company logo upload failed:", uploadErr);
        return res.status(400).json({
          message: uploadErr.message || "Failed to process company logo.",
          success: false
        });
      }
    }

    await company.save();

    return res.status(200).json({
      message: "Company information updated successfully.",
      company,
      success: true
    });

  } catch (error) {
    console.error("UPDATE COMPANY ERROR:", error);
    res.status(500).json({
      message: "Server error",
      success: false
    });
  }
};  