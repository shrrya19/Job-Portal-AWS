import React, { useState, useRef } from "react";
import axios from "axios";
import { UploadCloud, FileText, CheckCircle, AlertCircle, Loader2, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { RESUME_API_ENDPOINT } from "@/utils/constant";
import ResumeAnalyzerResult from "./ResumeAnalyzerResult";

const ResumeUpload = ({ onTransferToBuilder, onOpenJobMatcher }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateFile = (selectedFile) => {
    if (!selectedFile) return false;

    const allowedExtensions = [".pdf", ".docx", ".doc"];
    const ext = selectedFile.name.substring(selectedFile.name.lastIndexOf(".")).toLowerCase();

    if (!allowedExtensions.includes(ext)) {
      toast.error("Unsupported file format. Please upload a PDF or DOCX file.");
      return false;
    }

    // 10 MB limit
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("File is too large. Maximum file size is 10 MB.");
      return false;
    }

    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      if (validateFile(selected)) {
        setFile(selected);
      }
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!file) {
      toast.error("Please choose a resume file to upload.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(`${RESUME_API_ENDPOINT}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      if (res.data?.success) {
        toast.success("Resume uploaded and parsed successfully!");
        setUploadResult(res.data);
      } else {
        toast.error(res.data?.message || "Failed to analyze resume.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(
        err?.response?.data?.message || "Failed to process resume. Please ensure you are logged in."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* UPLOAD HERO BOX */}
      <div className="bg-white rounded-3xl border border-purple-100 shadow-md p-6 md:p-8">
        <div className="max-w-2xl mx-auto text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-[#6A38C2] flex items-center justify-center mx-auto mb-3">
            <UploadCloud size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Upload & Analyze Your Resume</h2>
          <p className="text-sm text-gray-600 mt-1">
            Upload your current resume in PDF or DOCX format to receive an instant ATS score, missing keyword insights, and actionable bullet rewrites.
          </p>
        </div>

        {/* DRAG & DROP ZONE */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-8 md:p-12 text-center cursor-pointer transition-all ${
            isDragging
              ? "border-[#6A38C2] bg-purple-50 scale-[1.01]"
              : "border-purple-200 hover:border-purple-400 bg-purple-50/30"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="p-4 bg-white rounded-2xl shadow-sm text-[#6A38C2]">
              <FileText size={36} />
            </div>

            {file ? (
              <div className="space-y-1">
                <p className="text-base font-semibold text-gray-800 flex items-center justify-center gap-2">
                  <CheckCircle size={16} className="text-emerald-500" />
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to analyze
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-sm md:text-base font-medium text-gray-700">
                  Drag and drop your resume here, or <span className="text-[#6A38C2] font-semibold underline">browse</span>
                </p>
                <p className="text-xs text-gray-500">
                  Supports PDF and DOCX (up to 10 MB)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* UPLOAD & ANALYZE ACTION BUTTON */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
          <Button
            onClick={handleUploadAndAnalyze}
            disabled={!file || loading}
            className="w-full sm:w-auto px-8 bg-[#6A38C2] hover:bg-[#5B21B6] text-white shadow-md disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Parsing Document & Evaluating ATS Metrics...
              </>
            ) : (
              <>
                <Sparkles size={16} className="mr-2" />
                Analyze Resume with ATS Engine
              </>
            )}
          </Button>

          {file && !loading && (
            <Button
              variant="outline"
              onClick={() => {
                setFile(null);
                setUploadResult(null);
              }}
              className="w-full sm:w-auto text-gray-600 border-gray-200"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* ANALYSIS RESULTS SECTION */}
      {uploadResult && (
        <div className="space-y-6">
          {/* Action Bar for Transferring to Builder or Job Matching */}
          <div className="bg-gradient-to-r from-purple-100 via-indigo-50 to-purple-50 p-6 rounded-3xl border border-purple-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Next Steps with this Resume</h3>
              <p className="text-xs text-gray-600">
                You can import this parsed resume directly into the interactive ATS Builder or compare it with a specific job description.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {onTransferToBuilder && uploadResult.resume?.resumeData && (
                <Button
                  onClick={() => onTransferToBuilder(uploadResult.resume.resumeData, uploadResult.resume._id)}
                  className="bg-[#6A38C2] hover:bg-[#5B21B6] text-white shadow"
                >
                  Edit in Resume Builder <ArrowRight size={16} className="ml-1" />
                </Button>
              )}

              {onOpenJobMatcher && (
                <Button
                  variant="outline"
                  onClick={() => onOpenJobMatcher(uploadResult.resume?.extractedText || uploadResult.resume?.resumeData)}
                  className="border-purple-300 text-[#6A38C2] hover:bg-purple-100/50"
                >
                  Tailor to Job Description
                </Button>
              )}
            </div>
          </div>

          <ResumeAnalyzerResult analysis={uploadResult.analysis} />
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;

