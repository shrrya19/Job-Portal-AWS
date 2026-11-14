import { Company } from "../models/company.model.js";
import { Job } from "../models/job.model.js";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import { storeImageSecurely } from "../utils/fileStorage.js";
import {
  canonicalizeIndiaLocation,
  isEligibleIndianJob,
  isIndianLocation,
} from "../utils/indiaLocation.js";

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
    if (error?.code === 11000) {
      return res.status(409).json({
        message: "A company with this name already exists.",
        success: false
      });
    }
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

export const getPublicCompanies = async (req, res) => {
  try {
    const requestedLocation = String(req.query.location || "").trim();
    const selectedLocation = requestedLocation && requestedLocation.toLowerCase() !== "all india"
      ? canonicalizeIndiaLocation(requestedLocation)
      : "";

    if (requestedLocation && requestedLocation.toLowerCase() !== "all india" && !selectedLocation) {
      return res.status(400).json({
        message: "Choose a valid city or state in India.",
        success: false
      });
    }

    const [companyRecords, jobRecords] = await Promise.all([
      Company.find({
        location: { $exists: true, $ne: "" },
        status: { $in: ["Active", null] }
      })
        .select("name description website location country logo industry status")
        .lean(),
      Job.find({
        location: { $exists: true, $ne: "" },
        status: { $in: ["Active", null] },
        $or: [
          { applicationDeadline: { $exists: false } },
          { applicationDeadline: null },
          { applicationDeadline: { $gt: new Date() } }
        ]
      })
        .select("location locations country company")
        .populate("company", "location country")
        .lean()
    ]);

    const companies = companyRecords
      .filter((company) => isIndianLocation(company.location, company.country, { allowRemote: false }))
      .map((company) => ({
        ...company,
        location: canonicalizeIndiaLocation(company.location),
        country: "India"
      }))
      .filter((company) => !selectedLocation || company.location === selectedLocation);

    const locations = [...new Set([
      ...companyRecords
        .filter((company) => isIndianLocation(company.location, company.country, { allowRemote: false }))
        .map((company) => canonicalizeIndiaLocation(company.location)),
      ...jobRecords
        .filter(isEligibleIndianJob)
        .flatMap((job) => Array.isArray(job.locations) && job.locations.length
          ? job.locations.map((location) => canonicalizeIndiaLocation(location))
          : [canonicalizeIndiaLocation(job.location)])
        .filter(Boolean)
    ])].sort((first, second) => first.localeCompare(second, "en-IN"));

    return res.status(200).json({
      companies,
      locations,
      success: true
    });
  } catch (error) {
    console.error("GET PUBLIC COMPANIES ERROR:", error);
    return res.status(500).json({
      message: "Unable to load India-based companies.",
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
    const { name, description, website, location, country, industry, companySize, contactEmail, contactPhone } = req.body;
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

    if (country !== undefined && String(country).trim().toLowerCase() !== "india") {
      return res.status(400).json({
        message: "Company locations must be in India.",
        success: false
      });
    }

    if (name !== undefined && name.trim()) company.name = name.trim();
    if (description !== undefined) company.description = description;
    if (website !== undefined) company.website = website;
    for (const [field, value, maxLength] of [
      ["industry", industry, 120],
      ["companySize", companySize, 40],
      ["contactEmail", contactEmail, 254],
      ["contactPhone", contactPhone, 40]
    ]) {
      if (value === undefined) continue;
      if (typeof value !== "string" || value.length > maxLength) {
        return res.status(400).json({
          message: `${field} must be ${maxLength} characters or fewer.`,
          success: false
        });
      }
      if (field === "contactEmail" && value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
        return res.status(400).json({
          message: "Enter a valid company contact email.",
          success: false
        });
      }
      company[field] = value.trim();
    }
    if (location !== undefined) {
      const canonicalLocation = canonicalizeIndiaLocation(location);
      if (!canonicalLocation || canonicalLocation === "Remote") {
        return res.status(400).json({
          message: "Choose a valid company city or state in India.",
          success: false
        });
      }
      company.location = canonicalLocation;
      company.country = "India";
    } else if (!company.country && isIndianLocation(company.location, company.country, { allowRemote: false })) {
      company.location = canonicalizeIndiaLocation(company.location);
      company.country = "India";
    }

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