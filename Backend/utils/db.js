import mongoose from 'mongoose';
import { Job } from "../models/job.model.js";

const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is required.");
    }

    await mongoose.connect(process.env.MONGO_URI);
    await Job.init();
    console.log("MongoDB connected successfully");
}

export default connectDB;