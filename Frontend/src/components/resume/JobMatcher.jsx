import React, { useState } from "react";
import axios from "axios";
import { Briefcase, Sparkles, CheckCircle2, XCircle, Lightbulb, Loader2, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { toast } from "sonner";
import { RESUME_API_ENDPOINT } from "@/utils/constant";

const JobMatcher = ({ initialResumeText, initialResumeData, onSwitchToBuilder }) => {
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleCompare = async () => {
    if (!jobDescription || !jobDescription.trim()) {
      toast.error("Please paste the job description to run tailoring analysis.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        jobDescription,
        targetRole,
        resumeText: initialResumeText,
        resumeData: initialResumeData
      };

      const res = await axios.post(`${RESUME_API_ENDPOINT}/compare-job`, payload, {
        withCredentials: true
      });

      if (res.data?.success) {
        setResult(res.data.comparison);
        toast.success("Job description comparison completed!");
      } else {
        toast.error(res.data?.message || "Comparison failed.");
      }
    } catch (err) {
      console.error("Job match error:", err);
      toast.error(
        err?.response?.data?.message || "Failed to compare job description. Make sure you are logged in."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* HEADER CARD */}
      <div className="bg-white rounded-3xl border border-purple-100 shadow-md p-6 md:p-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-purple-100 text-[#6A38C2] rounded-2xl">
            <Briefcase size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Job Description Matcher & Tailoring</h2>
            <p className="text-sm text-gray-600">
              Paste any target job description to discover missing keywords, measure qualification alignment, and receive role-specific optimization tips.
            </p>
          </div>
        </div>

        <div className="space-y-4 mt-6">
          <div>
            <Label className="font-semibold text-gray-800 text-sm">Target Role / Title</Label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Full Stack Developer, AWS Cloud Engineer, Data Scientist"
              className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6A38C2] text-sm"
            />
          </div>

          <div>
            <Label className="font-semibold text-gray-800 text-sm">Paste Job Description</Label>
            <textarea
              rows={8}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the complete job posting, requirements, qualifications, and responsibilities here..."
              className="mt-1 w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6A38C2] text-sm leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              onClick={handleCompare}
              disabled={loading || !jobDescription.trim()}
              className="bg-[#6A38C2] hover:bg-[#5B21B6] text-white px-6 shadow-md"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Analyzing Alignment...
                </>
              ) : (
                <>
                  <Sparkles size={16} className="mr-2" />
                  Compare & Calculate Match
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* RESULTS DISPLAY */}
      {result && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-purple-200 shadow-lg p-6 md:p-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-gray-100 pb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#6A38C2]">Target Role</span>
                <h3 className="text-2xl font-bold text-gray-900 mt-0.5">
                  {result.targetRole || "Target Position"}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Relevance and keyword frequency alignment against your resume.
                </p>
              </div>

              <div className="text-center sm:text-right">
                <div className="inline-flex flex-col items-center justify-center w-24 h-24 rounded-full border-4 border-[#6A38C2] bg-purple-50">
                  <span className="text-2xl font-black text-[#6A38C2]">{result.matchScore}%</span>
                  <span className="text-[10px] uppercase font-semibold text-gray-500">Match</span>
                </div>
              </div>
            </div>

            {/* Keyword Matches and Missing */}
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div className="bg-emerald-50/40 p-5 rounded-2xl border border-emerald-100">
                <h4 className="text-sm font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-2 mb-3">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  Matched Keywords ({result.matchedKeywords?.length || 0})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.matchedKeywords?.length > 0 ? (
                    result.matchedKeywords.map((kw, idx) => (
                      <Badge key={idx} className="bg-emerald-100 text-emerald-800 text-xs py-1 px-2.5">
                        {kw}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-gray-500 italic">None detected</span>
                  )}
                </div>
              </div>

              <div className="bg-rose-50/40 p-5 rounded-2xl border border-rose-100">
                <h4 className="text-sm font-bold uppercase tracking-wider text-rose-800 flex items-center gap-2 mb-3">
                  <XCircle size={16} className="text-rose-600" />
                  Missing In-Demand Keywords ({result.missingKeywords?.length || 0})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.missingKeywords?.length > 0 ? (
                    result.missingKeywords.map((kw, idx) => (
                      <Badge key={idx} className="bg-rose-100 text-rose-800 text-xs py-1 px-2.5">
                        {kw}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-gray-500 italic">All key JD skills matched!</span>
                  )}
                </div>
              </div>
            </div>

            {/* Tailoring Recommendations */}
            {result.tailoringRecommendations?.length > 0 && (
              <div className="mt-6 p-5 rounded-2xl bg-purple-50 border border-purple-100">
                <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                  <Lightbulb size={16} className="text-[#6A38C2]" />
                  Tailoring Recommendations for this Role
                </h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  {result.tailoringRecommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="text-[#6A38C2] font-bold mt-0.5">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {onSwitchToBuilder && (
              <div className="mt-6 flex justify-end">
                <Button
                  onClick={onSwitchToBuilder}
                  className="bg-[#6A38C2] hover:bg-[#5B21B6] text-white shadow"
                >
                  Apply Missing Keywords in Resume Builder <ArrowRight size={16} className="ml-1" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobMatcher;

