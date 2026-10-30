import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FileText,
  Clock,
  Sparkles,
  Trash2,
  Edit3,
  Download,
  AlertCircle,
  Loader2,
  Plus
} from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { toast } from "sonner";
import { RESUME_API_ENDPOINT } from "@/utils/constant";

const MyResumesList = ({ onEditResume, onViewReport, onCreateNew }) => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchResumes = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${RESUME_API_ENDPOINT}/my-resumes`, {
        withCredentials: true,
      });

      if (res.data?.success) {
        setResumes(res.data.resumes || []);
      }
    } catch (err) {
      console.error("Error fetching resumes:", err);
      toast.error(
        err?.response?.data?.message || "Failed to load saved resumes."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this resume?")) return;

    setDeletingId(id);
    try {
      const res = await axios.delete(`${RESUME_API_ENDPOINT}/${id}`, {
        withCredentials: true,
      });

      if (res.data?.success) {
        toast.success("Resume deleted successfully.");
        setResumes((prev) => prev.filter((r) => r._id !== id));
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err?.response?.data?.message || "Failed to delete resume.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-purple-100 p-12 text-center shadow-sm">
        <Loader2 className="mx-auto text-[#6A38C2] animate-spin mb-3" size={36} />
        <p className="text-gray-500 font-medium">Loading your saved resumes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Saved Resumes</h2>
          <p className="text-sm text-gray-600">
            Manage your drafts, re-evaluate ATS compatibility, and export your professional resumes.
          </p>
        </div>

        {onCreateNew && (
          <Button
            onClick={onCreateNew}
            className="bg-[#6A38C2] hover:bg-[#5B21B6] text-white shadow-md"
          >
            <Plus size={16} className="mr-1.5" /> Create New Resume
          </Button>
        )}
      </div>

      {resumes.length === 0 ? (
        <div className="bg-white rounded-3xl border border-purple-100 p-12 text-center shadow-sm max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-purple-50 text-[#6A38C2] flex items-center justify-center mx-auto mb-4">
            <FileText size={32} />
          </div>
          <h3 className="font-bold text-gray-900 text-lg mb-1">No Saved Resumes Yet</h3>
          <p className="text-sm text-gray-500 mb-6">
            Upload an existing PDF/DOCX resume or build a brand new ATS-optimized resume using our builder.
          </p>
          <div className="flex justify-center gap-3">
            {onCreateNew && (
              <Button
                onClick={onCreateNew}
                className="bg-[#6A38C2] hover:bg-[#5B21B6] text-white shadow"
              >
                Start Resume Builder
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume) => {
            const score = resume.analysis?.score || 0;
            const scoreColor =
              score >= 80
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : score >= 60
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-rose-50 text-rose-700 border-rose-200";

            return (
              <div
                key={resume._id}
                className="bg-white rounded-3xl border border-purple-100 shadow-md hover:shadow-lg transition-all p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="p-3 bg-purple-50 text-[#6A38C2] rounded-2xl">
                      <FileText size={22} />
                    </div>

                    <div className={`px-2.5 py-1 rounded-full border text-xs font-bold ${scoreColor}`}>
                      ATS Score: {score}/100
                    </div>
                  </div>

                  <h3 className="font-bold text-gray-900 text-lg line-clamp-1 mb-1">
                    {resume.title || "Untitled Resume"}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                    <Clock size={12} />
                    <span>
                      Updated {new Date(resume.updatedAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </span>
                    <span>•</span>
                    <span className="capitalize">{resume.source || "builder"}</span>
                  </div>

                  {resume.fileUrl && (
                    <p className="text-xs text-blue-600 truncate mb-3">
                      <a href={resume.fileUrl} target="_blank" rel="noreferrer" className="underline">
                        View Uploaded File
                      </a>
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {onEditResume && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEditResume(resume)}
                        className="text-xs border-purple-200 text-[#6A38C2] hover:bg-purple-50"
                      >
                        <Edit3 size={12} className="mr-1" /> Edit
                      </Button>
                    )}

                    {onViewReport && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onViewReport(resume.analysis)}
                        className="text-xs text-gray-600 hover:bg-gray-100"
                      >
                        <Sparkles size={12} className="mr-1 text-[#6A38C2]" /> Report
                      </Button>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={deletingId === resume._id}
                    onClick={(e) => handleDelete(resume._id, e)}
                    className="text-gray-400 hover:text-rose-600 hover:bg-rose-50 h-8 w-8 p-0"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyResumesList;

