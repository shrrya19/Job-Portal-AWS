import { Application } from "../models/application.model.js"
import { Job } from "../models/job.model.js"
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
        if (job.status === "Inactive") {
            return res.status(400).json({
                message: "This job is no longer accepting applications.",
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
            { _id: jobId, status: { $in: ["Active", null] } },
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
        const { status, note, recruiterNotes, interviewDate, interviewTime, interviewMode, offerSalary } = req.body;
        const applicationId = req.params.id;

        const normalizedStatus = status === undefined ? "" : normalizeApplicationStatus(status);
        const validStages = [
            "applied",
            "under review",
            "shortlisted",
            "interview scheduled",
            "interview cleared",
            "interview not cleared",
            "offer issued",
            "selected",
            "rejected"
        ];

        if ((status !== undefined && !validStages.includes(normalizedStatus)) ||
            (status === undefined && recruiterNotes === undefined)) {
            return res.status(400).json({
                message: "Choose a valid application status or provide recruiter notes.",
                success: false
            });
        }
        if (status !== undefined && normalizedStatus === "interview scheduled") {
            const parsedInterviewDate = new Date(interviewDate);
            if (!interviewDate || Number.isNaN(parsedInterviewDate.getTime()) || parsedInterviewDate <= new Date() ||
                typeof interviewTime !== "string" || !interviewTime.trim() ||
                !["Online", "Offline", "Hybrid"].includes(interviewMode)) {
                return res.status(400).json({
                    message: "To schedule an interview, provide a future date and time and choose Online, Offline, or Hybrid.",
                    success: false
                });
            }
        }
        if (status !== undefined && normalizedStatus === "offer issued" &&
            (typeof offerSalary !== "string" || !offerSalary.trim() || offerSalary.length > 100)) {
            return res.status(400).json({
                message: "Enter the offer salary or compensation details before issuing the offer.",
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
            "interview scheduled": ["shortlisted", "interview scheduled"],
            "interview cleared": ["interview scheduled"],
            "interview not cleared": ["interview scheduled"],
            "offer issued": ["interview cleared", "offer issued"]
        };
        if (status !== undefined && validTransitions[normalizedStatus] &&
            !validTransitions[normalizedStatus].includes(currentStatus)) {
            return res.status(409).json({
                message: normalizedStatus === "offer issued"
                    ? "Issue an offer only after marking the interview as cleared."
                    : "Update the candidate through the preceding application stage first.",
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
        }

        // Update stage details if provided
        if (interviewDate !== undefined || interviewTime !== undefined || interviewMode !== undefined ||
            offerSalary !== undefined || note !== undefined) {
            if (interviewDate !== undefined) application.stageDetails.interviewDate = interviewDate;
            if (interviewTime !== undefined) application.stageDetails.interviewTime = interviewTime;
            if (interviewMode !== undefined) application.stageDetails.interviewMode = interviewMode;
            if (offerSalary !== undefined) application.stageDetails.offerSalary = offerSalary;
            if (note !== undefined) application.stageDetails.note = note;
        }

        await application.save();

        return res.status(200).json({
            message: status === undefined
                ? "Recruiter notes saved."
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