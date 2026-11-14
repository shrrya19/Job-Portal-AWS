import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: String,
    website: String,
    location: String,
    country: String,
    logo: String,
    industry: { type: String, trim: true, maxlength: 120, default: "" },
    companySize: { type: String, trim: true, maxlength: 40, default: "" },
    contactEmail: { type: String, trim: true, lowercase: true, maxlength: 254, default: "" },
    contactPhone: { type: String, trim: true, maxlength: 40, default: "" },
    status: {
        type: String,
        enum: ["Active", "Inactive"],
        default: "Active"
    },
    isDemoData: {
        type: Boolean,
        default: false,
        select: false
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

export const Company = mongoose.model("Company", companySchema);