import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

const isAuthenticated = async (req, res, next) => {
    if (!process.env.SECRET_KEY) {
        return res.status(503).json({
            message: "Authentication is not configured.",
            success: false
        });
    }

    const authorization = req.headers.authorization;
    const bearerToken = authorization?.startsWith("Bearer ")
        ? authorization.slice(7)
        : null;
    const token = req.cookies?.token || bearerToken;

    if (!token) {
        return res.status(401).json({
            message: "User not authenticated",
            success: false
        });
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.SECRET_KEY);
    } catch {
        return res.status(401).json({
            message: "Invalid token",
            success: false
        });
    }

    if (typeof decoded !== "object" || !decoded.userId) {
        return res.status(401).json({
            message: "Invalid token",
            success: false
        });
    }

    try {
        const user = await User.findById(decoded.userId).select("role accountStatus");
        if (!user) {
            return res.status(401).json({
                message: "User not authenticated",
                success: false
            });
        }

        if (user.accountStatus === "Inactive") {
            return res.status(403).json({
                message: "This account is inactive. Contact support for assistance.",
                success: false
            });
        }

        req.id = user._id.toString();
        req.role = user.role;
        return next();
    } catch (error) {
        console.error("Authentication user lookup failed:", error);
        return res.status(500).json({
            message: "Unable to authenticate user",
            success: false
        });
    }
};

export default isAuthenticated;