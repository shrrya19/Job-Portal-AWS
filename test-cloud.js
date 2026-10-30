import "dotenv/config";
import cloudinary from "./Backend/utils/cloudinary.js";

const tinyPngBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

try {
  console.log("Testing Cloudinary upload with cloud_name:", process.env.CLOUD_NAME);
  const res = await cloudinary.uploader.upload(tinyPngBase64, {
    folder: "test_uploads"
  });
  console.log("Upload SUCCESS:", res.secure_url);
} catch (err) {
  console.error("Upload FAILED:", err.message, err.http_code, err);
}

