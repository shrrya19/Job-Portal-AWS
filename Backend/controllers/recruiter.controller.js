import mongoose from "mongoose";
import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { Resume } from "../models/resume.model.js";
import { compareWithJobDescription } from "../utils/atsAnalyzer.js";
import { normalizeApplicationStatus } from "../utils/applicationStatus.js";

const monthKey = (date) => `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;

export const getRecruiterDashboard = async (req, res) => {
    try {
        const jobs = await Job.find({ created_by: req.id })
            .select("title status createdAt applicationDeadline company")
            .populate("company", "name")
            .sort({ createdAt: -1 })
            .lean();
        const jobIds = jobs.map(({ _id }) => _id);
        const now = new Date();
        const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1));
        const upcomingQuery = {
            job: { $in: jobIds },
            "stageDetails.interviewDate": { $gte: now },
            status: { $nin: ["rejected", "declined", "offer rejected", "hired", "offer accepted"] }
        };

        const [statusCounts, jobCounts, monthlyCounts, recentApplications, upcomingInterviews, upcomingInterviewCount] = await Promise.all([
            Application.aggregate([
                { $match: { job: { $in: jobIds } } },
                { $group: { _id: "$status", count: { $sum: 1 } } }
            ]),
            Application.aggregate([
                { $match: { job: { $in: jobIds } } },
                { $group: { _id: "$job", count: { $sum: 1 } } }
            ]),
            Application.aggregate([
                { $match: { job: { $in: jobIds }, createdAt: { $gte: monthStart } } },
                { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, count: { $sum: 1 } } }
            ]),
            Application.find({ job: { $in: jobIds } })
                .sort({ createdAt: -1 })
                .limit(8)
                .select("job applicant status createdAt")
                .populate("job", "title")
                .populate("applicant", "fullName email profile.resume profile.resumeOriginalName")
                .lean(),
            Application.find(upcomingQuery)
                .sort({ "stageDetails.interviewDate": 1 })
                .limit(8)
                .select("job applicant status stageDetails.interviewDate stageDetails.interviewTime stageDetails.interviewMode stageDetails.interviewLink stageDetails.interviewLocation")
                .populate("job", "title")
                .populate("applicant", "fullName email")
                .lean(),
            Application.countDocuments(upcomingQuery)
        ]);

        const byStatus = new Map(statusCounts.map(({ _id, count }) => [normalizeApplicationStatus(_id), count]));
        const jobsById = new Map(jobCounts.map(({ _id, count }) => [String(_id), count]));
        const applicationTrend = Array.from({ length: 6 }, (_, index) => {
            const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5 + index, 1));
            const key = monthKey(date);
            return {
                month: date.toLocaleString("en", { month: "short", timeZone: "UTC" }),
                applications: monthlyCounts.find((item) => item._id === key)?.count || 0
            };
        });
        const totalApplications = statusCounts.reduce((total, item) => total + item.count, 0);

        return res.status(200).json({
            success: true,
            metrics: {
                totalJobs: jobs.length,
                activeJobs: jobs.filter((job) =>
                    job.status !== "Inactive" &&
                    job.status !== "Expired" &&
                    (!job.applicationDeadline || job.applicationDeadline > now)
                ).length,
                inactiveJobs: jobs.filter((job) => job.status === "Inactive").length,
                expiredJobs: jobs.filter((job) =>
                    job.status === "Expired" || (job.applicationDeadline && job.applicationDeadline <= now)
                ).length,
                totalApplications,
                shortlistedCandidates: byStatus.get("shortlisted") || 0,
                rejectedCandidates: byStatus.get("rejected") || 0,
                selectedCandidates: byStatus.get("selected") || 0,
                upcomingInterviews: upcomingInterviewCount
            },
            applicationTrend,
            jobs: jobs.slice(0, 5).map((job) => ({
                ...job,
                applicationCount: jobsById.get(String(job._id)) || 0
            })),
            recentApplications: recentApplications.map((application) => ({
                ...application,
                status: normalizeApplicationStatus(application.status)
            })),
            upcomingInterviewList: upcomingInterviews
        });
    } catch (error) {
        console.error("Recruiter dashboard analytics failed:", error);
        return res.status(500).json({ message: "Unable to load recruiter analytics.", success: false });
    }
};

export const rankJobCandidates = async (req, res) => {
    try {
        const { jobId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({ message: "A valid job id is required.", success: false });
        }

        const job = await Job.findOne({ _id: jobId, created_by: req.id }).lean();
        if (!job) {
            return res.status(404).json({ message: "Job not found.", success: false });
        }

        const applications = await Application.find({ job: job._id })
            .sort({ createdAt: -1 })
            .populate("applicant", "fullName email phoneNumber profile.skills profile.resume profile.resumeOriginalName")
            .lean();
        const applicantIds = applications.map((application) => application.applicant?._id).filter(Boolean);
        const resumes = await Resume.find({ userId: { $in: applicantIds } })
            .select("userId extractedText resumeData fileUrl fileName updatedAt")
            .sort({ updatedAt: -1 })
            .lean();
        const resumeByApplicant = new Map();
        for (const resume of resumes) {
            const id = String(resume.userId);
            if (!resumeByApplicant.has(id)) resumeByApplicant.set(id, resume);
        }

        const jobDescription = `${job.title}\n${job.description}\n${(job.requirements || []).join("\n")}`;
        const candidates = applications.map((application) => {
            const applicant = application.applicant;
            const resume = applicant ? resumeByApplicant.get(String(applicant._id)) : null;
            const resumeData = resume?.resumeData || {};
            const resumeSkills = [
                ...(applicant?.profile?.skills || []),
                ...(resumeData.skills?.technical || []),
                ...(resumeData.skills?.soft || []),
                ...(resumeData.skills?.tools || [])
            ];
            const resumeText = [
                resume?.extractedText || "",
                JSON.stringify(resumeData),
                resumeSkills.join(" ")
            ].join("\n");
            const comparison = compareWithJobDescription(resumeText, jobDescription, job.title);
            const normalizedResume = resumeText.toLowerCase();
            const requiredSkills = [...new Set((job.requirements || [])
                .flatMap((requirement) => String(requirement).split(/[,;\n]/))
                .map((skill) => skill.trim())
                .filter((skill) => skill.length > 1))];
            const matchesPhrase = (phrase) => new RegExp(
                `(?:^|[^a-z0-9])${phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+")}(?=$|[^a-z0-9])`,
                "i"
            ).test(normalizedResume);
            const matchedSkills = requiredSkills.filter(matchesPhrase);
            const missingSkills = requiredSkills.filter((skill) => !matchesPhrase(skill));
            const skillScore = requiredSkills.length
                ? (matchedSkills.length / requiredSkills.length) * 100
                : comparison.matchScore;
            const education = resumeData.education || [];
            const experience = resumeData.experience || [];
            const experienceYears = experience.reduce((total, item) => {
                if (!item.startDate) return total;
                const start = new Date(item.startDate);
                const end = item.current || !item.endDate ? new Date() : new Date(item.endDate);
                if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return total;
                return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
            }, 0);
            const statedExperienceYears = [...resumeText.matchAll(/\b(\d+(?:\.\d+)?)\s*\+?\s*(?:years?|yrs?)\b/gi)]
                .map((match) => Number(match[1]))
                .reduce((maximum, years) => Math.max(maximum, years), 0);
            const requiredExperience = Number(job.experienceLevel) || 0;
            const experienceMet = requiredExperience <= 0 ||
                experienceYears >= requiredExperience ||
                statedExperienceYears >= requiredExperience;
            const educationTerms = ["bachelor", "master", "degree", "diploma", "phd", "b.tech", "b.sc"]
                .filter((term) => jobDescription.toLowerCase().includes(term));
            const educationText = JSON.stringify(education).toLowerCase();
            const educationScore = educationTerms.length
                ? (educationTerms.some((term) => educationText.includes(term)) ? 100 : 0)
                : null;
            const signals = [
                ...(requiredSkills.length ? [{ score: skillScore, weight: 60 }] : []),
                ...(comparison.matchedKeywords.length ? [{ score: comparison.matchScore, weight: 25 }] : []),
                ...(requiredExperience > 0 ? [{
                    score: experienceMet ? 100 : Math.min(100, Math.round((experienceYears / requiredExperience) * 100)),
                    weight: 10
                }] : []),
                ...(educationScore !== null ? [{ score: educationScore, weight: 5 }] : [])
            ];
            const totalWeight = signals.reduce((total, signal) => total + signal.weight, 0);
            const score = totalWeight
                ? Math.round(signals.reduce((total, signal) => total + signal.score * signal.weight, 0) / totalWeight)
                : 0;
            const reasons = [
                `${matchedSkills.length} of ${requiredSkills.length} listed requirements found`,
                `${comparison.matchedKeywords.length} job-description keywords matched`,
                requiredExperience > 0
                    ? `${experienceYears.toFixed(1)} documented experience years; ${requiredExperience} required`
                    : "No minimum experience specified",
                educationTerms.length
                    ? (educationScore ? "Resume includes a listed education qualification" : "Listed education qualification was not found")
                    : (education.length ? "Education details are available" : "No education details found in the resume")
            ];

            return {
                applicationId: application._id,
                candidate: applicant ? {
                    _id: applicant._id,
                    fullName: applicant.fullName,
                    email: applicant.email,
                    phoneNumber: applicant.phoneNumber,
                    profile: applicant.profile
                } : null,
                status: normalizeApplicationStatus(application.status),
                appliedAt: application.createdAt,
                matchingScore: Math.min(100, score),
                matchedSkills: [...new Set(matchedSkills)],
                missingSkills: [...new Set(missingSkills)],
                matchedKeywords: comparison.matchedKeywords,
                missingKeywords: comparison.missingKeywords,
                education,
                experience,
                resumeUrl: resume?.fileUrl || applicant?.profile?.resume || "",
                resumeFileName: resume?.fileName || applicant?.profile?.resumeOriginalName || "",
                explanation: reasons
            };
        }).filter((candidate) => candidate.candidate);

        candidates.sort((first, second) =>
            second.matchingScore - first.matchingScore ||
            new Date(second.appliedAt).getTime() - new Date(first.appliedAt).getTime()
        );

        return res.status(200).json({
            success: true,
            job: { _id: job._id, title: job.title },
            rankingMethod: "Deterministic keyword, listed-requirement, education-evidence, and experience-evidence scoring; not an AI model.",
            candidates
        });
    } catch (error) {
        console.error("Candidate ranking failed:", error);
        return res.status(500).json({ message: "Unable to rank candidates for this job.", success: false });
    }
};

/**
 * Recruiter Search API
 * Allows recruiters to search their own jobs, job ID, or applicants.
 * Enforces strict security: only jobs and applicants belonging to the authenticated recruiter.
 */
export const searchRecruiterRecords = async (req, res) => {
    try {
        const recruiterId = req.id;
        const searchRaw = String(req.query.query || req.query.q || "").trim();
        const statusFilter = String(req.query.status || "all").trim();
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));

        // Security check: Only find jobs created by this authenticated recruiter
        const recruiterJobs = await Job.find({ created_by: recruiterId })
            .populate("company", "name logo location")
            .sort({ createdAt: -1 })
            .lean();

        const myJobIds = recruiterJobs.map((j) => j._id);

        let matchingJobs = [];
        let matchingApplicants = [];

        const isObjectId = mongoose.Types.ObjectId.isValid(searchRaw);

        if (searchRaw) {
            const escaped = searchRaw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const regex = new RegExp(escaped, "i");

            // Match recruiter's own jobs
            matchingJobs = recruiterJobs.filter((job) => {
                const matchesText =
                    regex.test(job.title || "") ||
                    regex.test(job.jobId || "") ||
                    regex.test(job.location || "") ||
                    regex.test((job.locations || []).join(" ")) ||
                    regex.test(job.jobType || "") ||
                    regex.test(job.company?.name || "") ||
                    regex.test(job.status || "") ||
                    (isObjectId && String(job._id) === searchRaw);

                const matchesStatus =
                    statusFilter === "all" ||
                    (job.status || "Active").toLowerCase() === statusFilter.toLowerCase();

                return matchesText && matchesStatus;
            });

            // Match applications belonging to this recruiter's jobs only!
            const applications = await Application.find({ job: { $in: myJobIds } })
                .populate("job", "title jobId company status createdAt")
                .populate("applicant", "fullName email phoneNumber profile.resume profile.resumeOriginalName")
                .sort({ createdAt: -1 })
                .lean();

            matchingApplicants = applications.filter((app) => {
                const matchesApp =
                    regex.test(app.applicant?.fullName || "") ||
                    regex.test(app.applicant?.email || "") ||
                    regex.test(app.applicant?.phoneNumber || "") ||
                    regex.test(app.status || "") ||
                    regex.test(app.job?.title || "") ||
                    regex.test(app.job?.jobId || "") ||
                    (isObjectId && (String(app._id) === searchRaw || String(app.applicant?._id) === searchRaw));

                return matchesApp;
            });
        } else {
            // When query is empty, return recruiter's jobs matching statusFilter
            matchingJobs = recruiterJobs.filter((job) =>
                statusFilter === "all" ||
                (job.status || "Active").toLowerCase() === statusFilter.toLowerCase()
            );

            matchingApplicants = await Application.find({ job: { $in: myJobIds } })
                .populate("job", "title jobId company status createdAt")
                .populate("applicant", "fullName email phoneNumber profile.resume profile.resumeOriginalName")
                .sort({ createdAt: -1 })
                .limit(10)
                .lean();
        }

        // Count total applications per job
        const jobAppCounts = await Application.aggregate([
            { $match: { job: { $in: myJobIds } } },
            { $group: { _id: "$job", count: { $sum: 1 } } }
        ]);
        const appCountMap = new Map(jobAppCounts.map((c) => [String(c._id), c.count]));

        const enrichedJobs = matchingJobs.map((job) => ({
            ...job,
            applicationCount: appCountMap.get(String(job._id)) || 0
        }));

        const totalJobs = enrichedJobs.length;
        const totalApplicants = matchingApplicants.length;
        const paginatedJobs = enrichedJobs.slice((page - 1) * limit, page * limit);
        const paginatedApplicants = matchingApplicants.slice((page - 1) * limit, page * limit);

        return res.status(200).json({
            success: true,
            jobs: paginatedJobs,
            applicants: paginatedApplicants,
            totalJobs,
            totalApplicants,
            page,
            totalPages: Math.ceil(Math.max(totalJobs, totalApplicants) / limit) || 1
        });
    } catch (error) {
        console.error("Recruiter search failed:", error);
        return res.status(500).json({
            message: "Unable to complete recruiter search.",
            success: false
        });
    }
};
