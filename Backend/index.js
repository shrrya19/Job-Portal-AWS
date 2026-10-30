import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from './utils/db.js';
import userRoute from './routes/user.route.js';
import companyRoute from './routes/company.route.js';
import jobRoute from './routes/job.route.js';
import applicationRoute from "./routes/application.route.js";
import eventRoute from "./routes/event.route.js";
import resumeRoute from "./routes/resume.route.js";
import interviewRoute from "./routes/interview.route.js";
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const configuredFrontendOrigins = (process.env.FRONTEND_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
const allowedFrontendOrigins = new Set([
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    ...configuredFrontendOrigins
]);
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedFrontendOrigins.has(origin)) {
            return callback(null, true);
        }
        return callback(new Error("Origin is not allowed by CORS."));
    },
    credentials: true
};
app.use(cors(corsOptions));

const PORT = process.env.PORT || 5000;

// API Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/company", companyRoute);
app.use("/api/v1/job", jobRoute);
app.use("/api/v1/application", applicationRoute);
app.use("/api/v1/event", eventRoute);
app.use("/api/v1/resume", resumeRoute);
app.use("/api/v1/interview", interviewRoute);

app.use((error, req, res, next) => {
    console.error("Unhandled request error:", error);
    if (res.headersSent) {
        return next(error);
    }

    return res.status(500).json({
        message: "Unexpected server error.",
        success: false
    });
});

const startServer = async () => {
    try {
        if (!process.env.SECRET_KEY) {
            throw new Error("SECRET_KEY is required. Add it to Backend/.env before starting the server.");
        }

        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server running at port ${PORT}`);
        });
    } catch (error) {
        console.error("Server startup failed:", error);
        process.exit(1);
    }
};

startServer();