import { Application } from "../models/application.model.js"
import { Job } from "../models/job.model.js"
import { Company } from "../models/company.model.js"
import { normalizeApplicationStatus } from "../utils/applicationStatus.js";

export const applyJob = async (req, res) => {
    try {
        const userId = req.id;
        const jobId = req.params.id;

        if (!jobId) {
            return res.status(400).json({
                message: "Job id not found.",
                success: false
            })
        }

        // Check whether the user has already applied for this job or not.
        const existingApplication = await Application.findOne({ job: jobId, applicant: userId })

        if (existingApplication) {
            return res.status(400).json({
                message: "You have already applied for the job.",
                success: false
            })
        }

        // Check whether the job exists or not.
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                message: "Job not found.",
                success: false
            })
        }
        if (job.status === "Inactive" || job.status === "Expired" ||
            (job.applicationDeadline && job.applicationDeadline <= new Date())) {
            return res.status(400).json({
                message: "This job is no longer accepting applications.",
                success: false
            });
        }
        const company = await Company.findOne({
            _id: job.company,
            status: { $in: ["Active", null] }
        }).select("_id");
        if (!company) {
            return res.status(400).json({
                message: "This company is not currently accepting applications.",
                success: false
            });
        }

        const newApplication = new Application({
            job: jobId,
            applicant: userId,
            status: "applied",
            stageHistory: [
                {
                    stage: "applied",
                    updatedAt: new Date(),
                    note: "Application submitted by candidate."
                }
            ]
        });

        const jobUpdate = await Job.updateOne(
            {
                _id: jobId,
                status: { $in: ["Active", null] },
                $or: [
                    { applicationDeadline: { $exists: false } },
                    { applicationDeadline: null },
                    { applicationDeadline: { $gt: new Date() } }
                ]
            },
            { $addToSet: { applications: newApplication._id } }
        );
        if (jobUpdate.matchedCount === 0) {
            const stillExists = await Job.exists({ _id: jobId });
            return res.status(stillExists ? 400 : 404).json({
                message: stillExists
                    ? "This job is no longer accepting applications."
                    : "Job not found.",
                success: false
            });
        }

        try {
            await newApplication.save();
        } catch (error) {
            try {
                await Job.updateOne(
                    { _id: jobId },
                    { $pull: { applications: newApplication._id } }
                );
            } catch (cleanupError) {
                console.error("Failed to remove an incomplete job application reference:", cleanupError);
            }
            throw error;
        }

        return res.status(201).json({
            message: "Job applied successfully.",
            success: true
        })
    }
    catch (error) {
        console.error("Job application failed:", error);
        return res.status(500).json({
            message: "Unable to apply for this job.",
            success: false
        });
    }
}

export const getAppliedJobs = async (req, res) => {
    try {
        const userId = req.id;
        const application = await Application.find({ applicant: userId })
            .select("-recruiterNotes")
            .sort({ createdAt: -1 })
            .populate({
            path: 'job',
            options: { sort: { createdAt: -1 } },
            populate: {
                path: 'company',
                options: { sort: { createdAt: -1 } }
            }
        });

        return res.status(200).json({
            application,
            success: true
        })
    }
    catch (error) {
        console.error("Applied jobs lookup failed:", error);
        return res.status(500).json({
            message: "Unable to load your applications.",
            success: false
        });
    }
}

// Admin will see how many users have applied.
export const getApplicants = async (req, res) => {
    try {

        const jobId = req.params.id;

        // first find job
        const job = await Job.findById(jobId).populate({
            path: "applications",
            populate: {
                path: "applicant"
            }
        });

        // then check
        if (!job) {
            return res.status(404).json({
                message: "Job not found.",
                success: false
            });
        }

        if (job.created_by.toString() !== req.id) {
            return res.status(403).json({
                message: "You are not authorized to view applicants for this job.",
                success: false
            });
        }

        return res.status(200).json({
            job,
            success: true
        });

    } catch (error) {
        console.error("Applicant lookup failed:", error);
        return res.status(500).json({
            message: "Unable to load applicants.",
            success: false
        });
    }
}

export const updateStatus = async (req, res) => {
    try {
        const {
            status,
            note,
            recruiterNotes,
            interviewDate,
            interviewTime,
            interviewMode,
            interviewLink,
            interviewLocation,
            interviewContact,
            offerSalary,
            offerAmount,
            offerCurrency,
            offerPeriod
        } = req.body;
        const applicationId = req.params.id;
        const hasStageDetails = [
            interviewDate,
            interviewTime,
            interviewMode,
            interviewLink,
            interviewLocation,
            interviewContact,
            offerSalary,
            offerAmount,
            offerCurrency,
            offerPeriod,
            note
        ].some((value) => value !== undefined);

        const normalizedStatus = status === undefined ? "" : normalizeApplicationStatus(status);
        const validStages = [
            "applied",
            "under review",
            "shortlisted",
            "interview scheduled",
            "interview cleared",
            "interview not cleared",
            "offer issued",
            "offer extended",
            "offer accepted",
            "offer rejected",
            "selected",
            "hired",
            "declined",
            "rejected"
        ];

        if ((status !== undefined && !validStages.includes(normalizedStatus)) ||
            (status === undefined && recruiterNotes === undefined && !hasStageDetails)) {
            return res.status(400).json({
                message: "Choose a valid application status or provide application details to save.",
                success: false
            });
        }
        const hasInterviewDetails = [
            interviewDate,
            interviewTime,
            interviewMode,
            interviewLink,
            interviewLocation,
            interviewContact
        ].some((value) => value !== undefined);
        if (hasInterviewDetails || (status !== undefined && normalizedStatus === "interview scheduled")) {
            const parsedInterviewDate = new Date(interviewDate);
            const validInterviewMode = ["Online", "In-person", "Phone", "Offline", "Hybrid"].includes(interviewMode);
            const validMeetingLink = interviewLink === undefined ||
                (typeof interviewLink === "string" && interviewLink.length <= 2048 &&
                (!interviewLink.trim() || (() => {
                    try {
                        return ["http:", "https:"].includes(new URL(interviewLink).protocol);
                    } catch {
                        return false;
                    }
                })()));
            const interviewDetailsValid =
                interviewDate && !Number.isNaN(parsedInterviewDate.getTime()) && parsedInterviewDate > new Date() &&
                typeof interviewTime === "string" &&
                (/^([01]\d|2[0-3]):[0-5]\d$/.test(interviewTime) || /^(0?[1-9]|1[0-2]):[0-5]\d\s?(AM|PM)$/i.test(interviewTime)) &&
                validInterviewMode && validMeetingLink &&
                (interviewMode !== "Online" || (typeof interviewLink === "string" && Boolean(interviewLink.trim()))) &&
                (interviewMode !== "In-person" || (typeof interviewLocation === "string" && Boolean(interviewLocation.trim()))) &&
                (interviewMode !== "Phone" || (typeof interviewContact === "string" && Boolean(interviewContact.trim()))) &&
                (interviewLocation === undefined || (typeof interviewLocation === "string" && interviewLocation.length <= 500)) &&
                (interviewContact === undefined || (typeof interviewContact === "string" && interviewContact.length <= 100));
            if (!interviewDetailsValid) {
                return res.status(400).json({
                    message: "Provide a valid future interview date, time, type, and the required type-specific details.",
                    success: false
                });
            }
        }
        const hasStructuredOfferDetails = offerAmount !== undefined || offerCurrency !== undefined || offerPeriod !== undefined;
        if ((hasStructuredOfferDetails && (
            typeof offerAmount !== "number" || !Number.isFinite(offerAmount) || offerAmount <= 0 ||
            !["INR", "USD", "EUR", "GBP", "CAD", "AUD"].includes(offerCurrency) ||
            !["hourly", "monthly", "annually"].includes(offerPeriod)
        )) || (offerSalary !== undefined &&
            (typeof offerSalary !== "string" || !offerSalary.trim() || offerSalary.length > 100))) {
            return res.status(400).json({
                message: "Enter valid offer salary or compensation details.",
                success: false
            });
        }
        if (recruiterNotes !== undefined && (typeof recruiterNotes !== "string" || recruiterNotes.length > 5000)) {
            return res.status(400).json({
                message: "Recruiter notes must be 5,000 characters or fewer.",
                success: false
            });
        }

        // Find application using application ID
        const application = await Application.findOne({
            _id: applicationId
        });

        if (!application) {
            return res.status(404).json({
                message: "Application not found.",
                success: false
            });
        }

        const job = await Job.findById(application.job).select("created_by");
        if (!job || job.created_by.toString() !== req.id) {
            return res.status(403).json({
                message: "You are not authorized to update this application.",
                success: false
            });
        }

        const currentStatus = normalizeApplicationStatus(application.status);
        const validTransitions = {
            "interview scheduled": ["applied", "under review", "shortlisted", "interview scheduled"],
            "interview cleared": ["interview scheduled", "shortlisted"],
            "interview not cleared": ["interview scheduled"],
            "offer issued": ["applied", "under review", "shortlisted", "interview scheduled", "interview cleared", "offer issued"],
            "offer accepted": ["offer issued", "selected", "offer accepted"],
            "offer rejected": ["applied", "under review", "shortlisted", "interview scheduled", "offer issued", "offer rejected"],
            "rejected": ["applied", "under review", "shortlisted", "interview scheduled", "interview not cleared", "offer issued", "rejected"]
        };
        if (status !== undefined && validTransitions[normalizedStatus] &&
            !validTransitions[normalizedStatus].includes(currentStatus)) {
            return res.status(409).json({
                message: "Update the candidate through the preceding application stage first.",
                success: false
            });
        }

        // Update status
        if (recruiterNotes !== undefined) {
            application.recruiterNotes = recruiterNotes.trim();
        }
        if (status !== undefined && normalizeApplicationStatus(application.status) !== normalizedStatus) {
            application.status = normalizedStatus;
            if (!Array.isArray(application.stageHistory)) application.stageHistory = [];
            application.stageHistory.push({
                stage: normalizedStatus,
                updatedAt: new Date(),
                note: note || `Application progressed to ${normalizedStatus}.`,
                updatedBy: req.id
            });
        } else if (status === undefined && interviewDate !== undefined && ["applied", "under review", "shortlisted"].includes(normalizeApplicationStatus(application.status))) {
            application.status = "interview scheduled";
            if (!Array.isArray(application.stageHistory)) application.stageHistory = [];
            application.stageHistory.push({
                stage: "interview scheduled",
                updatedAt: new Date(),
                note: note || "Interview scheduled by recruiter.",
                updatedBy: req.id
            });
        }

        // Update stage details if provided
        if (hasStageDetails) {
            if (interviewDate !== undefined) application.stageDetails.interviewDate = interviewDate;
            if (interviewTime !== undefined) application.stageDetails.interviewTime = interviewTime;
            if (interviewMode !== undefined) application.stageDetails.interviewMode = interviewMode;
            if (interviewLink !== undefined) application.stageDetails.interviewLink = interviewLink.trim();
            if (interviewLocation !== undefined) application.stageDetails.interviewLocation = interviewLocation.trim();
            if (interviewContact !== undefined) application.stageDetails.interviewContact = interviewContact.trim();
            if (offerSalary !== undefined) application.stageDetails.offerSalary = offerSalary;
            if (offerAmount !== undefined) application.stageDetails.offerAmount = offerAmount;
            if (offerCurrency !== undefined) application.stageDetails.offerCurrency = offerCurrency;
            if (offerPeriod !== undefined) application.stageDetails.offerPeriod = offerPeriod;
            if (note !== undefined) application.stageDetails.note = note;
        }

        await application.save();

        return res.status(200).json({
            message: status === undefined
                ? (recruiterNotes !== undefined && !hasStageDetails
                    ? "Recruiter notes saved."
                    : "Application details saved.")
                : `Candidate moved to "${normalizedStatus}".`,
            application,
            success: true
        });

    } catch (error) {
        console.error("Application status update failed:", error);
        return res.status(500).json({
            message: "Unable to update application status.",
            success: false
        });
    }
};

export const respondToOffer = async (req, res) => {
    try {
        const response = req.body.response;
        if (!["accepted", "rejected"].includes(response)) {
            return res.status(400).json({
                message: "Choose whether to accept or reject the offer.",
                success: false
            });
        }

        const nextStatus = response === "accepted" ? "offer accepted" : "offer rejected";
        const application = await Application.findOneAndUpdate(
            { _id: req.params.id, applicant: req.id, status: { $in: ["offer issued", "offer extended", "selected"] } },
            {
                $set: {
                    status: nextStatus,
                    "stageDetails.offerRespondedAt": new Date()
                },
                $push: {
                    stageHistory: {
                        stage: nextStatus,
                        updatedAt: new Date(),
                        note: response === "accepted"
                            ? "Candidate accepted the offer."
                            : "Candidate rejected the offer.",
                        updatedBy: req.id
                    }
                }
            },
            { new: true, runValidators: true }
        ).select("-recruiterNotes");

        if (!application) {
            const existingApplication = await Application.findOne({
                _id: req.params.id,
                applicant: req.id
            }).select("status");
            if (!existingApplication) {
                return res.status(404).json({
                    message: "Application not found.",
                    success: false
                });
            }
            return res.status(409).json({
                message: "This application does not have a pending offer.",
                success: false
            });
        }

        return res.status(200).json({
            message: response === "accepted" ? "Offer accepted successfully." : "Offer rejected.",
            application,
            success: true
        });
    } catch (error) {
        console.error("Offer response failed:", error);
        return res.status(500).json({
            message: "Unable to submit your offer response.",
            success: false
        });
    }
};