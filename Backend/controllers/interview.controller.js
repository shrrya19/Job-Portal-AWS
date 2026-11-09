import { Interview } from "../models/interview.model.js";
import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";
import { Application } from "../models/application.model.js";
import { generateJobSpecificQuestions, evaluateInterviewAnswers } from "../utils/interviewEngine.js";

// ================= GET ELIGIBLE JOBS FOR INTERVIEW =================
export const getEligibleJobs = async (req, res) => {
  try {
    const studentId = req.id;

    // 1. Get student's applied jobs
    const applications = await Application.find({ applicant: studentId })
      .populate({
        path: "job",
        populate: { path: "company" }
      });
    const appliedJobIds = new Set(applications.map(app => app.job?._id?.toString()).filter(Boolean));

    // 2. Get student's saved jobs
    const student = await User.findById(studentId).populate({
      path: "savedJobs",
      populate: { path: "company" }
    });
    const savedJobIds = new Set((student?.savedJobs || []).map(j => j?._id?.toString()).filter(Boolean));

    // 3. Get all available active jobs
    const allJobs = await Job.find({ status: { $in: ["Active", null] } })
      .populate("company")
      .sort({ createdAt: -1 })
      .limit(50);

    // Combine and mark relationships
    const jobMap = new Map();

    // Add applied jobs
    applications.forEach(app => {
      if (app.job) {
        const id = app.job._id.toString();
        jobMap.set(id, {
          ...app.job.toObject(),
          isApplied: true,
          isSaved: savedJobIds.has(id),
          applicationStatus: app.status
        });
      }
    });

    // Add saved jobs
    (student?.savedJobs || []).forEach(job => {
      if (job) {
        const id = job._id.toString();
        if (!jobMap.has(id)) {
          jobMap.set(id, {
            ...job.toObject(),
            isApplied: false,
            isSaved: true
          });
        }
      }
    });

    // Add remaining jobs from portal
    allJobs.forEach(job => {
      const id = job._id.toString();
      if (!jobMap.has(id)) {
        jobMap.set(id, {
          ...job.toObject(),
          isApplied: false,
          isSaved: false
        });
      }
    });

    const jobs = Array.from(jobMap.values());

    return res.status(200).json({
      success: true,
      jobs,
      appliedCount: appliedJobIds.size,
      savedCount: savedJobIds.size,
      totalAvailable: jobs.length
    });
  } catch (error) {
    console.error("GET ELIGIBLE JOBS ERROR:", error);
    return res.status(500).json({
      message: "Server error occurred while fetching eligible jobs.",
      success: false
    });
  }
};

// ================= GET JOB PREPARATION & PREVIEW QUESTIONS =================
export const getJobPreparationInfo = async (req, res) => {
  try {
    const studentId = req.id;
    const { jobId } = req.params;
    const { interviewType = "Mixed" } = req.query;

    const job = await Job.findById(jobId).populate("company");
    if (!job) {
      return res.status(404).json({
        message: "Job not found.",
        success: false
      });
    }

    const student = await User.findById(studentId);

    // Generate questions preview for this job
    const previewQuestions = generateJobSpecificQuestions(
      job,
      student?.profile || null,
      interviewType
    );

    return res.status(200).json({
      success: true,
      job,
      previewQuestions,
      preparationTips: [
        `Review core requirements: ${(job.requirements || []).join(", ") || "Technical fundamentals"}.`,
        "Structure answers using the STAR format (Situation, Task, Action, Result).",
        "Prepare specific project examples highlighting quantifiable outcomes.",
        "Practice speaking clearly and addressing architectural trade-offs."
      ]
    });
  } catch (error) {
    console.error("GET JOB PREP INFO ERROR:", error);
    return res.status(500).json({
      message: "Server error occurred while preparing job questions.",
      success: false
    });
  }
};

// ================= SCHEDULE INTERVIEW =================
export const scheduleInterview = async (req, res) => {
  try {
    const studentId = req.id;
    const {
      jobId,
      scheduledDate,
      timeSlot,
      durationMinutes = 45,
      interviewType = "Mixed",
      mode = "Self-Practice Demo",
      notes = ""
    } = req.body;

    if (!jobId || !scheduledDate || !timeSlot) {
      return res.status(400).json({
        message: "Job, scheduled date, and time slot are required.",
        success: false
      });
    }

    // 1. Verify Job existence
    const job = await Job.findById(jobId).populate("company");
    if (!job) {
      return res.status(404).json({
        message: "Selected job was not found.",
        success: false
      });
    }

    // 2. Date validation (Cannot schedule in the past)
    const interviewDate = new Date(scheduledDate);
    if (isNaN(interviewDate.getTime())) {
      return res.status(400).json({
        message: "Invalid interview date provided.",
        success: false
      });
    }

    // Compare date to start of current day in UTC
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const schedDay = new Date(interviewDate.getFullYear(), interviewDate.getMonth(), interviewDate.getDate());

    if (schedDay < todayStart) {
      return res.status(400).json({
        message: "Cannot schedule an interview session in the past.",
        success: false
      });
    }

    // 3. Prevent duplicate bookings / conflicts for the same student on the same date and slot
    const existingConflict = await Interview.findOne({
      studentId,
      scheduledDate: {
        $gte: new Date(interviewDate.setHours(0, 0, 0, 0)),
        $lte: new Date(interviewDate.setHours(23, 59, 59, 999))
      },
      timeSlot,
      status: { $in: ["Scheduled", "In Progress"] }
    });

    if (existingConflict) {
      return res.status(400).json({
        message: `You already have an active demo interview scheduled for this date during ${timeSlot}. Please choose a different time slot.`,
        success: false
      });
    }

    // 4. Generate persistent tailored questions for this session
    const student = await User.findById(studentId);
    const generatedQuestions = generateJobSpecificQuestions(
      job,
      student?.profile || null,
      interviewType
    );

    // 5. Create Interview Record
    const interview = await Interview.create({
      studentId,
      jobId: job._id,
      jobTitle: job.title,
      companyName: job.company?.name || "Hiring Partner",
      jobDescriptionSnapshot: job.description || "",
      requiredSkills: job.requirements || [],
      scheduledDate: schedDay,
      timeSlot,
      durationMinutes: Number(durationMinutes) || 45,
      interviewType,
      mode,
      notes: notes?.trim() || "",
      status: "Scheduled",
      questions: generatedQuestions
    });

    return res.status(201).json({
      message: "Demo interview scheduled successfully!",
      success: true,
      interview
    });
  } catch (error) {
    console.error("SCHEDULE INTERVIEW ERROR:", error);
    return res.status(500).json({
      message: "Server error occurred while scheduling demo interview.",
      success: false
    });
  }
};

// ================= GET STUDENT'S INTERVIEW SESSIONS & DASHBOARD STATS =================
export const getMyInterviews = async (req, res) => {
  try {
    const studentId = req.id;

    const interviews = await Interview.find({ studentId })
      .sort({ scheduledDate: -1, createdAt: -1 })
      .populate("jobId", "title location salary jobType");

    // Compute student interview dashboard summary
    const totalScheduled = interviews.length;
    const completed = interviews.filter(i => i.status === "Completed");
    const upcoming = interviews.filter(i => i.status === "Scheduled");
    const inProgress = interviews.filter(i => i.status === "In Progress");
    const cancelled = interviews.filter(i => i.status === "Cancelled");

    let latestScore = null;
    let avgScore = 0;

    if (completed.length > 0) {
      latestScore = completed[0].evaluation?.overallScore || 0;
      const totalScoreSum = completed.reduce((sum, item) => sum + (item.evaluation?.overallScore || 0), 0);
      avgScore = Math.round(totalScoreSum / completed.length);
    }

    return res.status(200).json({
      success: true,
      interviews,
      stats: {
        totalScheduled,
        upcomingCount: upcoming.length,
        inProgressCount: inProgress.length,
        completedCount: completed.length,
        cancelledCount: cancelled.length,
        latestScore,
        avgScore
      }
    });
  } catch (error) {
    console.error("GET MY INTERVIEWS ERROR:", error);
    return res.status(500).json({
      message: "Server error occurred while retrieving interview history.",
      success: false
    });
  }
};

// ================= GET SINGLE INTERVIEW BY ID =================
export const getInterviewById = async (req, res) => {
  try {
    const studentId = req.id;
    const { id } = req.params;

    const interview = await Interview.findById(id).populate("jobId");
    if (!interview) {
      return res.status(404).json({
        message: "Interview session not found.",
        success: false
      });
    }

    // Ownership check
    if (interview.studentId.toString() !== studentId) {
      return res.status(403).json({
        message: "You are not authorized to view this interview session.",
        success: false
      });
    }

    return res.status(200).json({
      success: true,
      interview
    });
  } catch (error) {
    console.error("GET INTERVIEW BY ID ERROR:", error);
    return res.status(500).json({
      message: "Server error occurred while retrieving interview details.",
      success: false
    });
  }
};

// ================= START / RESUME INTERVIEW =================
export const startInterview = async (req, res) => {
  try {
    const studentId = req.id;
    const { id } = req.params;

    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({
        message: "Interview session not found.",
        success: false
      });
    }

    if (interview.studentId.toString() !== studentId) {
      return res.status(403).json({
        message: "Unauthorized.",
        success: false
      });
    }

    if (interview.status === "Cancelled") {
      return res.status(400).json({
        message: "This interview was cancelled and cannot be started.",
        success: false
      });
    }

    if (interview.status === "Scheduled") {
      interview.status = "In Progress";
      interview.startedAt = new Date();
      await interview.save();
    }

    return res.status(200).json({
      message: "Interview started.",
      success: true,
      interview
    });
  } catch (error) {
    console.error("START INTERVIEW ERROR:", error);
    return res.status(500).json({
      message: "Server error occurred while starting interview.",
      success: false
    });
  }
};

// ================= SAVE ANSWER IN REAL-TIME =================
export const saveAnswer = async (req, res) => {
  try {
    const studentId = req.id;
    const { id } = req.params;
    const { questionId, answer } = req.body;

    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({
        message: "Interview session not found.",
        success: false
      });
    }

    if (interview.studentId.toString() !== studentId) {
      return res.status(403).json({
        message: "Unauthorized.",
        success: false
      });
    }

    const questionIndex = interview.questions.findIndex(q => q.id === questionId);
    if (questionIndex === -1) {
      return res.status(404).json({
        message: "Question not found in this interview session.",
        success: false
      });
    }

    interview.questions[questionIndex].studentAnswer = answer || "";
    interview.questions[questionIndex].answeredAt = new Date();

    if (interview.status === "Scheduled") {
      interview.status = "In Progress";
      interview.startedAt = new Date();
    }

    await interview.save();

    return res.status(200).json({
      message: "Answer progress saved.",
      success: true,
      savedQuestion: interview.questions[questionIndex]
    });
  } catch (error) {
    console.error("SAVE ANSWER ERROR:", error);
    return res.status(500).json({
      message: "Server error occurred while saving answer.",
      success: false
    });
  }
};

// ================= SUBMIT INTERVIEW AND GENERATE EVALUATION =================
export const submitInterview = async (req, res) => {
  try {
    const studentId = req.id;
    const { id } = req.params;
    const { answers } = req.body; // optional final array of answers [{ questionId, answer }]

    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({
        message: "Interview session not found.",
        success: false
      });
    }

    if (interview.studentId.toString() !== studentId) {
      return res.status(403).json({
        message: "Unauthorized.",
        success: false
      });
    }

    // Update any final answers passed
    if (Array.isArray(answers)) {
      answers.forEach(item => {
        const qIndex = interview.questions.findIndex(q => q.id === item.questionId);
        if (qIndex !== -1) {
          interview.questions[qIndex].studentAnswer = item.answer || "";
          interview.questions[qIndex].answeredAt = new Date();
        }
      });
    }

    // Run evaluation engine
    const evaluationResult = evaluateInterviewAnswers(interview, interview.questions);

    interview.status = "Completed";
    interview.completedAt = new Date();
    interview.evaluation = evaluationResult;

    await interview.save();

    return res.status(200).json({
      message: "Interview submitted and evaluated successfully!",
      success: true,
      interview,
      evaluation: evaluationResult
    });
  } catch (error) {
    console.error("SUBMIT INTERVIEW ERROR:", error);
    return res.status(500).json({
      message: "Server error occurred while evaluating interview.",
      success: false
    });
  }
};

// ================= RESCHEDULE INTERVIEW =================
export const rescheduleInterview = async (req, res) => {
  try {
    const studentId = req.id;
    const { id } = req.params;
    const { scheduledDate, timeSlot } = req.body;

    if (!scheduledDate || !timeSlot) {
      return res.status(400).json({
        message: "New scheduled date and time slot are required.",
        success: false
      });
    }

    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({
        message: "Interview session not found.",
        success: false
      });
    }

    if (interview.studentId.toString() !== studentId) {
      return res.status(403).json({
        message: "Unauthorized.",
        success: false
      });
    }

    if (interview.status === "Completed") {
      return res.status(400).json({
        message: "Completed interviews cannot be rescheduled.",
        success: false
      });
    }

    const interviewDate = new Date(scheduledDate);
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const schedDay = new Date(interviewDate.getFullYear(), interviewDate.getMonth(), interviewDate.getDate());

    if (schedDay < todayStart) {
      return res.status(400).json({
        message: "Cannot reschedule an interview to a past date.",
        success: false
      });
    }

    // Check conflict
    const conflict = await Interview.findOne({
      _id: { $ne: id },
      studentId,
      scheduledDate: {
        $gte: new Date(interviewDate.setHours(0, 0, 0, 0)),
        $lte: new Date(interviewDate.setHours(23, 59, 59, 999))
      },
      timeSlot,
      status: { $in: ["Scheduled", "In Progress"] }
    });

    if (conflict) {
      return res.status(400).json({
        message: `You already have another interview scheduled during ${timeSlot} on that date.`,
        success: false
      });
    }

    interview.scheduledDate = schedDay;
    interview.timeSlot = timeSlot;
    interview.status = "Scheduled";
    interview.rescheduledCount = (interview.rescheduledCount || 0) + 1;

    await interview.save();

    return res.status(200).json({
      message: "Interview rescheduled successfully.",
      success: true,
      interview
    });
  } catch (error) {
    console.error("RESCHEDULE INTERVIEW ERROR:", error);
    return res.status(500).json({
      message: "Server error occurred while rescheduling interview.",
      success: false
    });
  }
};

// ================= CANCEL INTERVIEW =================
export const cancelInterview = async (req, res) => {
  try {
    const studentId = req.id;
    const { id } = req.params;
    const { reason = "Cancelled by student" } = req.body;

    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({
        message: "Interview session not found.",
        success: false
      });
    }

    if (interview.studentId.toString() !== studentId) {
      return res.status(403).json({
        message: "Unauthorized.",
        success: false
      });
    }

    if (interview.status === "Completed") {
      return res.status(400).json({
        message: "Cannot cancel a completed interview.",
        success: false
      });
    }

    interview.status = "Cancelled";
    interview.cancellationReason = reason;

    await interview.save();

    return res.status(200).json({
      message: "Interview cancelled successfully.",
      success: true,
      interview
    });
  } catch (error) {
    console.error("CANCEL INTERVIEW ERROR:", error);
    return res.status(500).json({
      message: "Server error occurred while cancelling interview.",
      success: false
    });
  }
};
