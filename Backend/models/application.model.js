import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',  
        required: true
    },
    applicant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: [
            'applied',
            'shortlisted',
            'interview',
            'offer extended',
            'hired',
            'declined'
        ],
        default: 'applied'
    },
    stageHistory: [
        {
            stage: { type: String, required: true },
            updatedAt: { type: Date, default: Date.now },
            note: { type: String, default: "" },
            updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
        }
    ],
    stageDetails: {
        interviewDate: { type: Date },
        interviewTime: { type: String, default: "" },
        interviewMode: { type: String, default: "" },
        offerSalary: { type: String, default: "" },
        note: { type: String, default: "" }
    }
}, { timestamps: true });

export const Application = mongoose.model("Application", applicationSchema);