import { Application } from "../models/application.model.js"
import { Job } from "../models/job.model.js"

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
        const application = await Application.find({ applicant: userId }).sort({ createdAt: -1 }).populate({
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
        const { status, note, interviewDate, interviewTime, interviewMode, offerSalary } = req.body;
        const applicationId = req.params.id;

        const normalizedStatus = typeof status === "string" ? status.trim().toLowerCase() : "";
        const validStages = [
            "applied",
            "shortlisted",
            "interview",
            "offer extended",
            "hired",
            "declined"
        ];

        if (!validStages.includes(normalizedStatus)) {
            return res.status(400).json({
                message: "Choose a valid stage: applied, shortlisted, interview, offer extended, hired, or declined.",
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

        // Update status
        application.status = normalizedStatus;

        // Append to stage history
        if (!Array.isArray(application.stageHistory)) {
            application.stageHistory = [];
        }
        application.stageHistory.push({
            stage: normalizedStatus,
            updatedAt: new Date(),
            note: note || `Application progressed to ${normalizedStatus}.`,
            updatedBy: req.id
        });

        // Update stage details if provided
        if (interviewDate || interviewTime || interviewMode || offerSalary || note) {
            application.stageDetails = {
                interviewDate: interviewDate || application.stageDetails?.interviewDate,
                interviewTime: interviewTime || application.stageDetails?.interviewTime || "",
                interviewMode: interviewMode || application.stageDetails?.interviewMode || "",
                offerSalary: offerSalary || application.stageDetails?.offerSalary || "",
                note: note || application.stageDetails?.note || ""
            };
        }

        await application.save();

        return res.status(200).json({
            message: `Candidate moved to "${normalizedStatus}".`,
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