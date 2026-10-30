import mongoose from "mongoose";

const questionItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  question: { type: String, required: true },
  category: {
    type: String,
    enum: ["Technical", "Scenario", "Behavioral", "HR", "Resume-Based", "General"],
    default: "Technical",
  },
  context: { type: String, default: "" }, // Reason/skill context for this question
  expectedKeywords: [{ type: String }],
  suggestedConcepts: [{ type: String }],
  studentAnswer: { type: String, default: "" },
  answeredAt: { type: Date },
});

const questionFeedbackSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  question: { type: String },
  category: { type: String },
  score: { type: Number, min: 0, max: 100, default: 0 },
  feedback: { type: String, default: "" },
  coveredConcepts: [{ type: String }],
  missingConcepts: [{ type: String }],
  modelAnswer: { type: String, default: "" },
});

const interviewSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
    jobTitle: {
      type: String,
      required: true,
      trim: true,
    },
    companyName: {
      type: String,
      default: "Company",
    },
    jobDescriptionSnapshot: {
      type: String,
      default: "",
    },
    requiredSkills: [{ type: String }],
    scheduledDate: {
      type: Date,
      required: true,
      index: true,
    },
    timeSlot: {
      type: String,
      required: true, // e.g. "10:00 AM - 10:45 AM"
    },
    durationMinutes: {
      type: Number,
      default: 45,
      min: 15,
      max: 120,
    },
    interviewType: {
      type: String,
      enum: ["Technical", "HR", "Behavioral", "Mixed"],
      default: "Mixed",
    },
    mode: {
      type: String,
      enum: ["Self-Practice Demo", "Virtual Video", "In-Person"],
      default: "Self-Practice Demo",
    },
    status: {
      type: String,
      enum: ["Scheduled", "In Progress", "Completed", "Cancelled"],
      default: "Scheduled",
      index: true,
    },
    notes: {
      type: String,
      default: "",
    },
    cancellationReason: {
      type: String,
      default: "",
    },
    rescheduledCount: {
      type: Number,
      default: 0,
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    questions: [questionItemSchema],
    evaluation: {
      overallScore: { type: Number, min: 0, max: 100, default: 0 },
      technicalScore: { type: Number, min: 0, max: 100, default: 0 },
      completenessScore: { type: Number, min: 0, max: 100, default: 0 },
      clarityScore: { type: Number, min: 0, max: 100, default: 0 },
      strengths: [{ type: String }],
      improvements: [{ type: String }],
      questionFeedback: [questionFeedbackSchema],
      recommendedTopics: [{ type: String }],
      evaluatedAt: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

// Prevent double bookings for the same student on the same date and time slot (unless cancelled)
interviewSchema.index(
  { studentId: 1, scheduledDate: 1, timeSlot: 1, status: 1 },
  { name: "student_slot_status_idx" }
);

export const Interview = mongoose.model("Interview", interviewSchema);

