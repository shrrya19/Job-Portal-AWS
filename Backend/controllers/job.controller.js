import { Job } from "../models/job.model.js";
import { Company } from "../models/company.model.js";
import { Application } from "../models/application.model.js";
import {
    canonicalizeIndiaLocation,
    isEligibleIndianJob,
    isIndianLocation,
} from "../utils/indiaLocation.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const getSearchPatterns = (token) => {
    const patterns = new Set([escapeRegex(token)]);
    if (token.length > 4) {
        for (let index = 0; index < token.length; index += 1) {
            patterns.add(escapeRegex(`${token.slice(0, index)}${token.slice(index + 1)}`));
        }
    }
    return [...patterns];
};
const jobTypes = ["Full-Time", "Contract", "Internship"];
const DUPLICATE_JOB_ID_MESSAGE = "This Job ID is already in use. Enter a unique Job ID.";
const normalizeIdentityValue = (value) =>
    value.trim().replace(/\s+/g, " ").toLowerCase();
const isValidJobId = (value) =>
    typeof value === "string" && /^[A-Za-z0-9][A-Za-z0-9_-]{2,49}$/.test(value.trim());
const duplicateJobIdQuery = (jobId, excludeId) => ({
    $or: [
        { jobIdNormalized: normalizeIdentityValue(jobId) },
        { jobIdLegacyNormalized: normalizeIdentityValue(jobId) },
    ],
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
});
const isDuplicateKeyError = (error) => error?.code === 11000;
const canonicalizeJobLocations = (locations, fallbackLocation) => {
    const candidates = Array.isArray(locations) && locations.length
        ? locations
        : [fallbackLocation];
    if (!candidates.length) return null;
    const normalizedLocations = candidates.map((location) => canonicalizeIndiaLocation(location));
    if (normalizedLocations.some((location) => !location)) return null;
    const canonicalLocations = [...new Set(normalizedLocations)];
    if (!canonicalLocations.length) return null;
    if (canonicalLocations.includes("Remote") && canonicalLocations.length > 1) return null;
    return canonicalLocations;
};
const findDuplicateJobPosting = ({ company, title, location, experience, excludeId }) => {
    const normalizedTitle = normalizeIdentityValue(title);
    const query = {
        company,
        $or: [
            { titleNormalized: normalizedTitle },
            { title: { $regex: `^${escapeRegex(title.trim().replace(/\s+/g, " "))}$`, $options: "i" } }
        ],
        location,
        experienceLevel: experience,
        ...(excludeId ? { _id: { $ne: excludeId } } : {})
    };
    return Job.exists(query);
};

// Here you see posted jobs by Admin
export const postJob = async (req, res) => {
    try {
        const {
            title,
            description,
            requirements,
            salary,
            location,
            locations,
            jobType,
            experience,
            jobId,
            position,
            companyId,
            country,
            responsibilities,
            qualification,
            workMode,
            salaryMin,
            salaryMax,
            salaryUnit,
            applicationDeadline
        } = req.body;

        const userId = req.id;

        // Validation
        const requirementsArray = Array.isArray(requirements)
            ? requirements
            : String(requirements || "").split(",");
        const parsedSalary = Number(salary);
        const parsedExperience = Number(experience);
        const parsedPosition = Number(position);
        const parsedSalaryMin = salaryMin === undefined || salaryMin === "" ? parsedSalary : Number(salaryMin);
        const parsedSalaryMax = salaryMax === undefined || salaryMax === "" ? parsedSalary : Number(salaryMax);
        const parsedDeadline = applicationDeadline ? new Date(applicationDeadline) : null;
        const responsibilityList = Array.isArray(responsibilities)
            ? responsibilities
            : String(responsibilities || "").split(/\r?\n/);
        const normalizedJobType = typeof jobType === "string" && jobType.trim() === "Full Time"
            ? "Full-Time"
            : typeof jobType === "string"
                ? jobType.trim()
                : jobType;

        if (
            typeof title !== "string" ||
            !title.trim() ||
            !isValidJobId(jobId) ||
            typeof description !== "string" ||
            !description.trim() ||
            requirementsArray.every((requirement) => !String(requirement).trim()) ||
            (!Array.isArray(locations) && (typeof location !== "string" || !location.trim())) ||
            !jobTypes.includes(normalizedJobType) ||
            !Number.isFinite(parsedSalary) ||
            parsedSalary < 0 ||
            !Number.isFinite(parsedSalaryMin) ||
            !Number.isFinite(parsedSalaryMax) ||
            parsedSalaryMin < 0 ||
            parsedSalaryMax < parsedSalaryMin ||
            !Number.isFinite(parsedExperience) ||
            parsedExperience < 0 ||
            !Number.isInteger(parsedPosition) ||
            parsedPosition < 1 ||
            !companyId
            || (workMode !== undefined && !["Remote", "Hybrid", "On-site"].includes(workMode))
            || (applicationDeadline && Number.isNaN(parsedDeadline.getTime()))
            || (qualification !== undefined && (typeof qualification !== "string" || qualification.length > 200))
            || (typeof salaryUnit === "string" && salaryUnit.length > 30)
        ) {
            return res.status(400).json({
                message: "Provide valid values for every required job field. Job ID must be 3-50 letters, numbers, hyphens, or underscores.",
                success: false
            });
        }

        const canonicalLocations = canonicalizeJobLocations(locations, location);
        if (
            !canonicalLocations ||
            (country !== undefined && String(country).trim().toLowerCase() !== "india")
        ) {
            return res.status(400).json({
                message: "Choose a valid city in India or Remote for the job location.",
                success: false
            });
        }

        const company = await Company.findOne({ _id: companyId, userId });
        if (!company) {
            return res.status(403).json({
                message: "Select a company that belongs to your account.",
                success: false
            });
        }
        if (!isIndianLocation(company.location, company.country, { allowRemote: false })) {
            return res.status(400).json({
                message: "Add a valid Indian city to the company profile before posting jobs.",
                success: false
            });
        }

        const duplicate = await Job.exists(duplicateJobIdQuery(jobId));
        if (duplicate) {
            return res.status(409).json({
                message: DUPLICATE_JOB_ID_MESSAGE,
                success: false
            });
        }
        const duplicatePosting = await findDuplicateJobPosting({
            company: companyId,
            title,
            location: canonicalLocations[0],
            experience: parsedExperience
        });
        if (duplicatePosting) {
            return res.status(409).json({
                message: "A job with this company, title, location, and experience level already exists.",
                success: false
            });
        }

        // Create Job
        const job = await Job.create({
            title: title.trim(),
            jobId: jobId.trim(),
            locations: canonicalLocations,
            description: description.trim(),
            requirements: requirementsArray.map((requirement) => String(requirement).trim()).filter(Boolean),
            salary: parsedSalary,
            salaryMin: parsedSalaryMin,
            salaryMax: parsedSalaryMax,
            salaryUnit: typeof salaryUnit === "string" && salaryUnit.trim() ? salaryUnit.trim() : "LPA",
            location: canonicalLocations[0],
            country: "India",
            jobType: normalizedJobType,
            experienceLevel: parsedExperience,
            position: parsedPosition,
            responsibilities: responsibilityList.map((item) => String(item).trim()).filter(Boolean),
            qualification: typeof qualification === "string" ? qualification.trim() : "",
            workMode: workMode || "On-site",
            ...(parsedDeadline ? { applicationDeadline: parsedDeadline } : {}),
            company: companyId,
            created_by: userId
        });

        return res.status(201).json({
            message: "New job created successfully.",
            job,
            success: true
        });

    } catch (error) {
        console.error("Job creation failed:", error);

        if (isDuplicateKeyError(error)) {
            return res.status(409).json({
                message: DUPLICATE_JOB_ID_MESSAGE,
                success: false
            });
        }
        return res.status(500).json({
            message: "Server error",
            success: false
        });
    }
};


// For Students - Get All Jobs
export const getAllJobs = async (req, res) => {
    try {
        const keyword = String(req.query.keyword || "").trim().slice(0, 100);
        const keywordTokens = keyword.split(/\s+/).filter(Boolean);
        const query = {};

        if (keywordTokens.length) {
            const tokenPatterns = keywordTokens.map(getSearchPatterns);
            const matchingCompanies = await Company.find({
                $or: tokenPatterns.flatMap((patterns) => patterns.map((pattern) => ({
                    $or: [
                        { name: { $regex: pattern, $options: "i" } },
                        { industry: { $regex: pattern, $options: "i" } }
                    ]
                })))
            }).select("_id name industry");
            const searchConditions = keywordTokens.map((token, index) => {
                const patterns = tokenPatterns[index];
                const conditions = patterns.flatMap((pattern) => [
                    { title: { $regex: pattern, $options: "i" } },
                    { description: { $regex: pattern, $options: "i" } },
                    { requirements: { $regex: pattern, $options: "i" } },
                    { jobId: { $regex: pattern, $options: "i" } },
                    { location: { $regex: pattern, $options: "i" } },
                    { locations: { $regex: pattern, $options: "i" } },
                    { jobType: { $regex: pattern, $options: "i" } }
                ]);
                const matchingCompanyIds = matchingCompanies
                    .filter((company) => patterns.some((pattern) =>
                        new RegExp(pattern, "i").test(company.name) ||
                        new RegExp(pattern, "i").test(company.industry || "")
                    ))
                    .map((company) => company._id);

                if (matchingCompanyIds.length) {
                    conditions.push({
                        company: { $in: matchingCompanyIds }
                    });
                }

                return { $or: conditions };
            });

            query.$and = searchConditions;
        }

        const requestedLocation = String(req.query.location || "").trim().slice(0, 100);
        const location = requestedLocation && requestedLocation.toLowerCase() !== "all india"
            ? canonicalizeIndiaLocation(requestedLocation)
            : "";
        if (requestedLocation && requestedLocation.toLowerCase() !== "all india" && !location) {
            return res.status(400).json({
                message: "Choose a valid city or state in India.",
                success: false
            });
        }

        const experience = String(req.query.experience || "").trim();
        const experienceMatch = experience.match(/^(?:(\d+)-(\d+)|(\d+)\+)$/);
        if (experienceMatch) {
            query.experienceLevel = experienceMatch[3]
                ? { $gte: Number(experienceMatch[3]) }
                : {
                    $gte: Number(experienceMatch[1]),
                    $lte: Number(experienceMatch[2])
                };
        }

        const jobs = await Job.find({
            ...query,
            status: { $in: ["Active", null] },
            $and: [
                ...(query.$and || []),
                { $or: [{ applicationDeadline: { $exists: false } }, { applicationDeadline: null }, { applicationDeadline: { $gt: new Date() } }] }
            ]
        }).populate({
            path: "company",
            match: { status: { $in: ["Active", null] } }
        }).sort({ createdAt: -1 });
        const indianJobs = jobs
            .filter(isEligibleIndianJob)
            .map((job) => {
                const result = job.toObject();
                result.locations = canonicalizeJobLocations(job.locations, job.location);
                result.location = result.locations?.[0] || canonicalizeIndiaLocation(job.location);
                result.country = "India";
                if (result.company && isIndianLocation(result.company.location, result.company.country, { allowRemote: false })) {
                    result.company.location = canonicalizeIndiaLocation(result.company.location);
                    result.company.country = "India";
                }
                return result;
            })
            .filter((job) => !location || job.locations?.includes(location));

        return res.status(200).json({
            jobs: indianJobs,
            success: true
        });

    } catch (error) {
        console.error("Job search failed:", error);

        return res.status(500).json({
            message: "Server error",
            success: false
        });
    }
};


// For Student - Get Single Job By ID
export const getJobById = async (req, res) => {
    try {
        const jobId = req.params.id;

        const job = await Job.findById(jobId)
            .populate({ path: "applications", select: "applicant" })
            .populate({
                path: "company",
                match: { status: { $in: ["Active", null] } }
            });

        if (!job) {
            return res.status(404).json({
                message: "Job not found.",
                success: false
            });
        }
        if ((job.status && job.status !== "Active") ||
            (job.applicationDeadline && job.applicationDeadline <= new Date())) {
            return res.status(404).json({
                message: "Job not found.",
                success: false
            });
        }
        if (!isEligibleIndianJob(job)) {
            return res.status(404).json({
                message: "Job not found.",
                success: false
            });
        }
        const publicJob = job.toObject();
        publicJob.locations = canonicalizeJobLocations(job.locations, job.location);
        publicJob.location = publicJob.locations?.[0] || canonicalizeIndiaLocation(job.location);
        publicJob.country = "India";
        if (publicJob.company && isIndianLocation(publicJob.company.location, publicJob.company.country, { allowRemote: false })) {
            publicJob.company.location = canonicalizeIndiaLocation(publicJob.company.location);
            publicJob.company.country = "India";
        }

        return res.status(200).json({
            job: publicJob,
            success: true
        });

    } catch (error) {
        console.error("Job lookup failed:", error);

        return res.status(500).json({
            message: "Server error",
            success: false
        });
    }
};

export const getAdminJobById = async (req, res) => {
    try {
        const job = await Job.findOne({
            _id: req.params.id,
            created_by: req.id,
        }).populate("company");

        if (!job) {
            return res.status(404).json({
                message: "Job not found.",
                success: false
            });
        }

        return res.status(200).json({ job, success: true });
    } catch (error) {
        console.error("Recruiter job lookup failed:", error);
        return res.status(500).json({
            message: "Unable to load this job.",
            success: false
        });
    }
};


// How many jobs admin has posted
export const getAdminJobs = async (req, res) => {
    try {
        const adminId = req.id;

        const jobs = await Job.find({
            created_by: adminId
        }).sort({ createdAt: -1 }).populate("company");

        return res.status(200).json({
            jobs,
            success: true
        });

    } catch (error) {
        console.error("Recruiter job lookup failed:", error);

        return res.status(500).json({
            message: "Server error",
            success: false
        });
    }
};

// Recruiter Updates Job
export const updateJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        const userId = req.id;
        const {
            title,
            jobId: submittedJobId,
            description,
            requirements,
            salary,
            location,
            locations,
            jobType,
            experience,
            position,
            companyId,
            country,
            responsibilities,
            qualification,
            workMode,
            salaryMin,
            salaryMax,
            salaryUnit,
            applicationDeadline
        } = req.body;

        const job = await Job.findById(jobId).select("+jobIdLegacyNormalized");
        if (!job) {
            return res.status(404).json({
                message: "Job not found.",
                success: false
            });
        }

        if (job.created_by.toString() !== userId) {
            return res.status(403).json({
                message: "You are not authorized to update this job.",
                success: false
            });
        }
        if (country !== undefined && String(country).trim().toLowerCase() !== "india") {
            return res.status(400).json({
                message: "Job locations must be in India.",
                success: false
            });
        }

        if (title !== undefined) {
            if (typeof title !== "string" || !title.trim()) {
                return res.status(400).json({ message: "Job title is required.", success: false });
            }
            job.title = title.trim();
        }
        if (submittedJobId !== undefined || !job.jobId) {
            if (!isValidJobId(submittedJobId)) {
                return res.status(400).json({
                    message: "Job ID is required and must be 3-50 letters, numbers, hyphens, or underscores.",
                    success: false
                });
            }
            job.jobId = submittedJobId.trim();
            job.jobIdLegacyNormalized = undefined;
        }
        if (description !== undefined) {
            if (typeof description !== "string" || !description.trim()) {
                return res.status(400).json({ message: "Job description is required.", success: false });
            }
            job.description = description.trim();
        }
        if (location !== undefined || locations !== undefined) {
            const canonicalLocations = canonicalizeJobLocations(locations, location);
            if (!canonicalLocations) {
                return res.status(400).json({
                    message: "Choose one or more valid Indian locations. Remote must be selected by itself.",
                    success: false
                });
            }
            job.locations = canonicalLocations;
            job.location = canonicalLocations[0];
            job.country = "India";
        } else if (isIndianLocation(job.location, job.country)) {
            job.locations = canonicalizeJobLocations(job.locations, job.location) || [canonicalizeIndiaLocation(job.location)];
            job.location = job.locations[0];
            job.country = "India";
        }
        if (jobType !== undefined) {
            const normalizedType = jobType === "Full Time" ? "Full-Time" : jobType;
            if (typeof normalizedType !== "string" || !jobTypes.includes(normalizedType.trim())) {
                return res.status(400).json({ message: "Choose Full-Time, Contract, or Internship.", success: false });
            }
            job.jobType = normalizedType.trim();
        }
        if (salary !== undefined) {
            const parsedSalary = Number(salary);
            if (!Number.isFinite(parsedSalary) || parsedSalary < 0) {
                return res.status(400).json({ message: "Salary must be a non-negative number.", success: false });
            }
            job.salary = parsedSalary;
        }
        for (const [field, value] of [["salaryMin", salaryMin], ["salaryMax", salaryMax]]) {
            if (value === undefined) continue;
            const parsedValue = Number(value);
            if (!Number.isFinite(parsedValue) || parsedValue < 0) {
                return res.status(400).json({ message: "Salary range must contain non-negative numbers.", success: false });
            }
            job[field] = parsedValue;
        }
        if (job.salaryMin !== undefined && job.salaryMax !== undefined && job.salaryMax < job.salaryMin) {
            return res.status(400).json({ message: "Maximum salary must be greater than or equal to minimum salary.", success: false });
        }
        if (salaryUnit !== undefined) {
            if (typeof salaryUnit !== "string" || salaryUnit.trim().length > 30) {
                return res.status(400).json({ message: "Salary unit must be 30 characters or fewer.", success: false });
            }
            job.salaryUnit = salaryUnit.trim() || "LPA";
        }
        if (workMode !== undefined) {
            if (!["Remote", "Hybrid", "On-site"].includes(workMode)) {
                return res.status(400).json({ message: "Choose Remote, Hybrid, or On-site as the work mode.", success: false });
            }
            job.workMode = workMode;
        }
        if (qualification !== undefined) {
            if (typeof qualification !== "string" || qualification.length > 200) {
                return res.status(400).json({ message: "Qualification must be 200 characters or fewer.", success: false });
            }
            job.qualification = qualification.trim();
        }
        if (responsibilities !== undefined) {
            const list = Array.isArray(responsibilities) ? responsibilities : String(responsibilities).split(/\r?\n/);
            job.responsibilities = list.map((item) => String(item).trim()).filter(Boolean);
        }
        if (applicationDeadline !== undefined) {
            const deadline = applicationDeadline ? new Date(applicationDeadline) : null;
            if (deadline && Number.isNaN(deadline.getTime())) {
                return res.status(400).json({ message: "Choose a valid application deadline.", success: false });
            }
            job.applicationDeadline = deadline || undefined;
        }
        if (experience !== undefined) {
            const parsedExperience = Number(experience);
            if (!Number.isFinite(parsedExperience) || parsedExperience < 0) {
                return res.status(400).json({ message: "Experience must be a non-negative number.", success: false });
            }
            job.experienceLevel = parsedExperience;
        }
        if (position !== undefined) {
            const parsedPosition = Number(position);
            if (!Number.isInteger(parsedPosition) || parsedPosition < 1) {
                return res.status(400).json({ message: "Number of positions must be at least one.", success: false });
            }
            job.position = parsedPosition;
        }

        const jobCompany = companyId
            ? await Company.findOne({ _id: companyId, userId })
            : await Company.findById(job.company);
        if (!jobCompany) {
            return res.status(companyId ? 403 : 400).json({
                message: companyId
                    ? "Select a valid company belonging to your account."
                    : "Select a company with a valid Indian location.",
                success: false
            });
        }
        if (!isIndianLocation(jobCompany.location, jobCompany.country, { allowRemote: false })) {
            return res.status(400).json({
                message: "Select a company with a valid Indian location.",
                success: false
            });
        }
        if (companyId) {
            job.company = companyId;
        }

        if (requirements !== undefined) {
            const reqArray = Array.isArray(requirements)
                ? requirements
                : String(requirements).split(",");
            const cleaned = reqArray.map((r) => String(r).trim()).filter(Boolean);
            if (cleaned.length === 0) {
                return res.status(400).json({ message: "Add at least one job requirement.", success: false });
            }
            job.requirements = cleaned;
        }

        const duplicate = await Job.exists(duplicateJobIdQuery(job.jobId, job._id));
        if (duplicate) {
            return res.status(409).json({
                message: DUPLICATE_JOB_ID_MESSAGE,
                success: false
            });
        }
        const duplicatePosting = await findDuplicateJobPosting({
            company: job.company,
            title: job.title,
            location: job.location,
            experience: job.experienceLevel,
            excludeId: job._id
        });
        if (duplicatePosting) {
            return res.status(409).json({
                message: "A job with this company, title, location, and experience level already exists.",
                success: false
            });
        }

        await job.save();

        const updatedJob = await Job.findById(jobId).populate("company");

        return res.status(200).json({
            message: "Job updated successfully.",
            job: updatedJob,
            success: true
        });

    } catch (error) {
        console.error("Job update failed:", error);
        if (isDuplicateKeyError(error)) {
            return res.status(409).json({
                message: DUPLICATE_JOB_ID_MESSAGE,
                success: false
            });
        }
        return res.status(500).json({
            message: "Failed to update job.",
            success: false
        });
    }
};

export const updateJobStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!["Active", "Inactive"].includes(status)) {
            return res.status(400).json({
                message: "Choose Active or Inactive as the job status.",
                success: false
            });
        }

        const job = await Job.findOneAndUpdate(
            { _id: req.params.id, created_by: req.id },
            { $set: { status } },
            { new: true, runValidators: true }
        ).populate("company");

        if (!job) {
            return res.status(404).json({
                message: "Job not found or you are not authorized to update it.",
                success: false
            });
        }

        return res.status(200).json({
            message: `Job status changed to ${status}.`,
            job,
            success: true
        });
    } catch (error) {
        console.error("Job status update failed:", error);
        return res.status(500).json({
            message: "Unable to update job status.",
            success: false
        });
    }
};

// Recruiter Deletes Job
export const deleteJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        const userId = req.id;

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                message: "Job not found.",
                success: false
            });
        }

        if (job.created_by.toString() !== userId) {
            return res.status(403).json({
                message: "You are not authorized to delete this job.",
                success: false
            });
        }

        // Delete associated applications
        await Application.deleteMany({ job: jobId });

        // Delete the job
        await Job.findByIdAndDelete(jobId);

        return res.status(200).json({
            message: "Job and its applications deleted successfully.",
            jobId,
            success: true
        });

    } catch (error) {
        console.error("Job deletion failed:", error);
        return res.status(500).json({
            message: "Failed to delete job.",
            success: false
        });
    }
};

// Search suggestions for student and general search bar
export const getSearchSuggestions = async (req, res) => {
    try {
        const query = String(req.query.q || req.query.query || "").trim().slice(0, 50);
        if (!query || query.length < 2) {
            return res.status(200).json({ suggestions: [], success: true });
        }

        const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(escaped, "i");

        const [jobs, companies] = await Promise.all([
            Job.find({
                status: { $in: ["Active", null] },
                $or: [
                    { title: regex },
                    { jobId: regex },
                    { location: regex },
                    { locations: regex },
                    { requirements: regex },
                    { jobType: regex }
                ]
            })
                .select("title jobId location locations requirements jobType")
                .limit(15)
                .lean(),
            Company.find({
                $or: [
                    { name: regex },
                    { industry: regex }
                ]
            })
                .select("name industry")
                .limit(5)
                .lean()
        ]);

        const suggestionsSet = new Set();

        jobs.forEach((j) => {
            if (j.title && regex.test(j.title)) suggestionsSet.add(j.title);
            if (j.jobId && regex.test(j.jobId)) suggestionsSet.add(`Job ID: ${j.jobId}`);
            if (j.location && regex.test(j.location)) suggestionsSet.add(j.location);
            if (Array.isArray(j.locations)) {
                j.locations.forEach((loc) => {
                    if (loc && regex.test(loc)) suggestionsSet.add(loc);
                });
            }
            if (Array.isArray(j.requirements)) {
                j.requirements.forEach((reqItem) => {
                    if (reqItem && regex.test(reqItem)) suggestionsSet.add(reqItem);
                });
            }
        });

        companies.forEach((c) => {
            if (c.name && regex.test(c.name)) suggestionsSet.add(c.name);
            if (c.industry && regex.test(c.industry)) suggestionsSet.add(c.industry);
        });

        return res.status(200).json({
            success: true,
            suggestions: Array.from(suggestionsSet).slice(0, 8)
        });
    } catch (error) {
        console.error("Search suggestions failed:", error);
        return res.status(500).json({ message: "Failed to load suggestions", success: false });
    }
};