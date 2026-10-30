import multer from "multer";

const storage = multer.memoryStorage();
const uploadSingle = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 1
    }
}).single("file");

export const singleUpload = (req, res, next) => {
    uploadSingle(req, res, (error) => {
        if (!error) {
            return next();
        }

        if (error instanceof multer.MulterError) {
            return res.status(error.code === "LIMIT_FILE_SIZE" ? 413 : 400).json({
                message: error.code === "LIMIT_FILE_SIZE"
                    ? "Uploaded file exceeds the 10 MB limit."
                    : "Invalid file upload.",
                success: false
            });
        }

        return next(error);
    });
};