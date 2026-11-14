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
            'under review',
            'shortlisted',
            'interview',
            'interview scheduled',
            'interview cleared',
            'interview not cleared',
            'offer issued',
            'offer accepted',
            'offer rejected',
            'offer extended',
            'hired',
            'declined',
            'selected',
            'rejected'
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
    recruiterNotes: {
        type: String,
        default: "",
        maxlength: 5000
    },
    stageDetails: {
        interviewDate: { type: Date },
        interviewTime: { type: String, default: "" },
        interviewMode: { type: String, default: "" },
        interviewLink: { type: String, default: "" },
        interviewLocation: { type: String, default: "" },
        interviewContact: { type: String, default: "" },
        offerSalary: { type: String, default: "" },
        offerAmount: { type: Number },
        offerCurrency: { type: String, default: "" },
        offerPeriod: { type: String, default: "" },
        offerRespondedAt: { type: Date },
        note: { type: String, default: "" }
    }
}, { timestamps: true });

export const Application = mongoose.model("Application", applicationSchema);