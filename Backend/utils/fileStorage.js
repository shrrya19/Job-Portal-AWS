import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cloudinary from "./cloudinary.js";
import getDataUri from "./datauri.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_UPLOADS_DIR = path.resolve(__dirname, "../uploads");
const SUBDIRS = ["resumes", "profiles", "companies", "images"];

SUBDIRS.forEach((dir) => {
    const targetDir = path.join(BASE_UPLOADS_DIR, dir);
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }
});

const getBaseServerUrl = () => {
    return process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
};

/**
 * Stores an image (profile photo, company logo, etc.) securely:
 * 1. Validates that the file is an image.
 * 2. Attempts Cloudinary upload if configured.
 * 3. Safely falls back to local server disk storage if Cloudinary fails, is unconfigured, or has invalid credentials.
 */
export const storeImageSecurely = async (file, prefix = "img", subfolder = "images") => {
    if (!file || !file.buffer) {
        throw new Error("No image file received.");
    }

    const mime = file.mimetype || "";
    const originalName = file.originalname || "";
    const isImage = mime.startsWith("image/") || /\.(png|jpe?g|webp|gif|svg|bmp|ico)$/i.test(originalName);

    if (!isImage) {
        throw new Error("Uploaded file must be a valid image (PNG, JPG, WEBP, GIF, SVG).");
    }

    const sanitizedBase = path.basename(originalName).replace(/[^a-zA-Z0-9.-]/g, "_") || "image.png";
    const timestamp = Date.now();
    const storedFileName = `${prefix}_${timestamp}_${sanitizedBase}`;

    // 1. Try Cloudinary if credentials exist
    if (process.env.CLOUD_NAME && process.env.API_KEY && process.env.API_SECRET) {
        try {
            const fileUri = getDataUri(file);
            const uploadRes = await cloudinary.uploader.upload(fileUri.content, {
                folder: `job_portal/${subfolder}`,
                resource_type: "image"
            });
            if (uploadRes?.secure_url) {
                return {
                    fileUrl: uploadRes.secure_url,
                    fileName: originalName || storedFileName,
                    storageType: "cloudinary"
                };
            }
        } catch (cloudErr) {
            console.warn(
                `[Cloudinary] Image upload failed (${cloudErr.message}). Safely falling back to local storage.`
            );
        }
    }

    // 2. Fallback: Save to local directory
    const targetFolder = path.join(BASE_UPLOADS_DIR, subfolder);
    if (!fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder, { recursive: true });
    }

    const targetPath = path.join(targetFolder, storedFileName);
    fs.writeFileSync(targetPath, file.buffer);

    const publicUrl = `${getBaseServerUrl()}/uploads/${subfolder}/${storedFileName}`;

    return {
        fileUrl: publicUrl,
        fileName: originalName || storedFileName,
        storageType: "local"
    };
};

/**
 * Stores document files (resumes, etc.) securely:
 * 1. Tries Cloudinary first if configured.
 * 2. Falls back safely to local disk storage if Cloudinary fails or is not configured.
 */
export const storeFileSecurely = async (file, prefix = "resume", subfolder = "resumes") => {
    if (!file || !file.buffer) {
        throw new Error("No file content received.");
    }

    const sanitizedBase = file.originalname
        ? path.basename(file.originalname).replace(/[^a-zA-Z0-9.-]/g, "_")
        : "document.pdf";
    const timestamp = Date.now();
    const storedFileName = `${prefix}_${timestamp}_${sanitizedBase}`;

    // Try Cloudinary if cloud name is configured
    if (process.env.CLOUD_NAME && process.env.API_KEY && process.env.API_SECRET) {
        try {
            const fileUri = getDataUri(file);
            const uploadRes = await cloudinary.uploader.upload(fileUri.content, {
                resource_type: "raw",
                public_id: `resumes/${path.parse(storedFileName).name}`
            });
            if (uploadRes?.secure_url) {
                return {
                    fileUrl: uploadRes.secure_url,
                    fileName: file.originalname || storedFileName,
                    storageType: "cloudinary"
                };
            }
        } catch (cloudErr) {
            console.warn(
                `[Cloudinary] Document upload failed (${cloudErr.message}). Safely falling back to local storage.`
            );
        }
    }

    // Fallback: Save to local directory
    const targetFolder = path.join(BASE_UPLOADS_DIR, subfolder);
    if (!fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder, { recursive: true });
    }

    const targetPath = path.join(targetFolder, storedFileName);
    fs.writeFileSync(targetPath, file.buffer);

    const publicUrl = `${getBaseServerUrl()}/uploads/${subfolder}/${storedFileName}`;

    return {
        fileUrl: publicUrl,
        fileName: file.originalname || storedFileName,
        storageType: "local"
    };
};
