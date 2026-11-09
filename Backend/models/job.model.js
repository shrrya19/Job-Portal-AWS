import mongoose from "mongoose";

const normalizeIdentityValue = (value) =>
  typeof value === "string" ? value.trim().replace(/\s+/g, " ").toLowerCase() : "";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    jobId: {
      type: String,
      trim: true,
      match: /^[A-Za-z0-9][A-Za-z0-9_-]{2,49}$/,
    },

    titleNormalized: {
      type: String,
      select: false,
    },

    jobIdNormalized: {
      type: String,
      select: false,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

    description: {
      type: String,
      required: true,
    },

    requirements: [
      {
        type: String,
        required: true,
      },
    ],

    salary: {
      type: Number,
      required: true,
      min: 0,
    },

    experienceLevel: {
      type: Number,
      required: true,
    },

    location: {
      type: String,
      required: true,
    },

    country: String,

    jobType: {
      type: String,
      required: true,
      enum: ["Full-Time", "Full Time", "Part-Time", "Internship", "Contract"],
    },

    position: {
      type: Number,
      required: true,
      min: 1,
    },

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    applications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Application",
      },
    ],
  },
  {
    timestamps: true,
  }
);

jobSchema.pre("validate", function normalizeJobIdentity() {
  this.titleNormalized = normalizeIdentityValue(this.title);
  this.jobIdNormalized = normalizeIdentityValue(this.jobId) || undefined;
});

jobSchema.index(
  {
    company: 1,
    titleNormalized: 1,
    jobIdNormalized: 1,
    experienceLevel: 1,
  },
  {
    unique: true,
    name: "unique_company_job_identity",
    partialFilterExpression: {
      titleNormalized: { $type: "string" },
      jobIdNormalized: { $type: "string" },
    },
  }
);

export const Job = mongoose.model("Job", jobSchema);