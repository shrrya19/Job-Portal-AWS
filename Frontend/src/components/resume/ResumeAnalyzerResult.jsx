import React, { useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Lightbulb,
  Sparkles,
  Info,
  Copy,
  Check,
  TrendingUp,
  FileCheck,
  Briefcase
} from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { toast } from "sonner";

const ResumeAnalyzerResult = ({ analysis, jobComparison, onApplySuggestion }) => {
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!analysis) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-purple-100 text-center text-gray-500 shadow-sm">
        <Info className="mx-auto text-purple-400 mb-2" size={32} />
        <p>No analysis results available yet. Upload a resume or click "Analyze" to see your score.</p>
      </div>
    );
  }

  const {
    score = 0,
    breakdown = {},
    strengths = [],
    issues = [],
    suggestions = [],
    detectedKeywords = [],
    detectedSoftSkills = [],
    missingSections = [],
    weakBullets = [],
    disclaimer
  } = analysis;

  const getScoreColor = (val) => {
    if (val >= 80) return "text-emerald-600 border-emerald-500 bg-emerald-50";
    if (val >= 60) return "text-amber-600 border-amber-500 bg-amber-50";
    return "text-rose-600 border-rose-500 bg-rose-50";
  };

  const getScoreBadge = (val) => {
    if (val >= 80) return { label: "Excellent ATS Match", bg: "bg-emerald-100 text-emerald-800" };
    if (val >= 60) return { label: "Good - Needs Minor Polish", bg: "bg-amber-100 text-amber-800" };
    return { label: "Needs Significant Improvement", bg: "bg-rose-100 text-rose-800" };
  };

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    toast.success("Rewritten bullet copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const scoreBadgeInfo = getScoreBadge(score);

  return (
    <div className="space-y-6">
      {/* 1. SCORE SUMMARY CARD */}
      <div className="bg-white rounded-3xl border border-purple-100 shadow-lg p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            {/* Score Ring / Gauge */}
            <div
              className={`w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center font-black ${getScoreColor(
                score
              )}`}
            >
              <span className="text-3xl tracking-tight">{score}</span>
              <span className="text-[10px] tracking-wider uppercase font-semibold text-gray-500">out of 100</span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-gray-900">ATS Compatibility Score</h2>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${scoreBadgeInfo.bg}`}>
                  {scoreBadgeInfo.label}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1 max-w-lg">
                Estimated parsing match calculated using Applicant Tracking System heuristics, industry keywords, and formatting standards.
              </p>
            </div>
          </div>

          <div className="w-full md:w-auto flex md:flex-col gap-2">
            <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 text-center flex-1 md:w-44">
              <span className="text-xs text-gray-500 block">Keywords Found</span>
              <strong className="text-lg text-[#6A38C2]">{detectedKeywords.length}</strong>
            </div>
            <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 text-center flex-1 md:w-44">
              <span className="text-xs text-gray-500 block">Missing Sections</span>
              <strong className={`text-lg ${missingSections.length > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                {missingSections.length}
              </strong>
            </div>
          </div>
        </div>

        {/* Breakdown Progress Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-8 pt-6 border-t border-gray-100">
          <div>
            <div className="flex justify-between text-xs font-medium text-gray-600 mb-1">
              <span>Contact Info</span>
              <span>{breakdown.contactScore || 0}/15</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#6A38C2] h-full rounded-full transition-all duration-500"
                style={{ width: `${((breakdown.contactScore || 0) / 15) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium text-gray-600 mb-1">
              <span>Core Sections</span>
              <span>{breakdown.sectionsScore || 0}/25</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${((breakdown.sectionsScore || 0) / 25) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium text-gray-600 mb-1">
              <span>Bullet Quality</span>
              <span>{breakdown.bulletQualityScore || 0}/25</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-violet-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${((breakdown.bulletQualityScore || 0) / 25) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium text-gray-600 mb-1">
              <span>Keywords & Skills</span>
              <span>{breakdown.skillsScore || 0}/20</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-purple-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${((breakdown.skillsScore || 0) / 20) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium text-gray-600 mb-1">
              <span>ATS Formatting</span>
              <span>{breakdown.formattingScore || 0}/15</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-fuchsia-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${((breakdown.formattingScore || 0) / 15) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. JOB DESCRIPTION MATCH RESULTS (if active) */}
      {jobComparison && (
        <div className="bg-white rounded-3xl border border-purple-200 shadow-md p-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-100 text-[#6A38C2] rounded-xl">
                <Briefcase size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">
                  Job Match Analysis {jobComparison.targetRole && `— ${jobComparison.targetRole}`}
                </h3>
                <p className="text-xs text-gray-500">Comparison against target job description</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-500 block">JD Match</span>
              <strong className="text-2xl text-[#6A38C2] font-black">{jobComparison.matchScore}%</strong>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5 mb-2">
                <CheckCircle2 size={14} /> Matched Keywords ({jobComparison.matchedKeywords?.length || 0})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {jobComparison.matchedKeywords?.length > 0 ? (
                  jobComparison.matchedKeywords.map((kw, i) => (
                    <Badge key={i} className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 text-xs">
                      {kw}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-gray-400 italic">No direct keyword overlap found.</span>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5 mb-2">
                <XCircle size={14} /> Missing Keywords in Resume ({jobComparison.missingKeywords?.length || 0})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {jobComparison.missingKeywords?.length > 0 ? (
                  jobComparison.missingKeywords.map((kw, i) => (
                    <Badge key={i} className="bg-rose-100 text-rose-800 hover:bg-rose-200 text-xs">
                      {kw}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-gray-400 italic">All target skills detected in resume!</span>
                )}
              </div>
            </div>
          </div>

          {jobComparison.tailoringRecommendations?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100 bg-purple-50/50 p-4 rounded-xl">
              <h4 className="text-xs font-bold text-gray-800 flex items-center gap-2 mb-2">
                <Lightbulb size={14} className="text-[#6A38C2]" /> Role Tailoring Recommendations
              </h4>
              <ul className="space-y-1.5 text-xs text-gray-700">
                {jobComparison.tailoringRecommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#6A38C2] font-bold">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 3. STRENGTHS, ISSUES & ACTIONABLE SUGGESTIONS */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* STRENGTHS */}
        <div className="bg-white rounded-3xl border border-purple-100 shadow-md p-6">
          <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2 mb-4">
            <CheckCircle2 className="text-emerald-500" size={20} />
            <span>Key Strengths</span>
          </h3>

          <ul className="space-y-3">
            {strengths.length > 0 ? (
              strengths.map((str, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-gray-700 bg-emerald-50/40 p-3 rounded-xl border border-emerald-100/60">
                  <CheckCircle2 className="text-emerald-600 shrink-0 mt-0.5" size={16} />
                  <span>{str}</span>
                </li>
              ))
            ) : (
              <li className="text-sm text-gray-400 italic">No specific strengths detected yet.</li>
            )}
          </ul>
        </div>

        {/* ISSUES & MISSING SECTIONS */}
        <div className="bg-white rounded-3xl border border-purple-100 shadow-md p-6">
          <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2 mb-4">
            <AlertTriangle className="text-amber-500" size={20} />
            <span>Areas to Improve</span>
          </h3>

          <ul className="space-y-3">
            {issues.length > 0 ? (
              issues.map((iss, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-gray-700 bg-amber-50/40 p-3 rounded-xl border border-amber-100/60">
                  <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={16} />
                  <span>{iss}</span>
                </li>
              ))
            ) : (
              <li className="text-sm text-gray-400 italic">No critical issues detected.</li>
            )}
          </ul>
        </div>
      </div>

      {/* 4. ACTIONABLE SUGGESTIONS */}
      <div className="bg-gradient-to-r from-purple-50 via-white to-purple-50 rounded-3xl border border-purple-200 shadow-md p-6">
        <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2 mb-4">
          <Lightbulb className="text-[#6A38C2]" size={20} />
          <span>Recommended Action Plan</span>
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          {suggestions.map((sug, idx) => (
            <div key={idx} className="bg-white p-4 rounded-2xl border border-purple-100 shadow-sm flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#6A38C2] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {idx + 1}
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{sug}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. WEAK BULLET POINTS & 1-CLICK REWRITES */}
      {weakBullets.length > 0 && (
        <div className="bg-white rounded-3xl border border-purple-100 shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="text-[#6A38C2]" size={20} />
              <h3 className="font-bold text-gray-900 text-lg">
                Action-Verb & Bullet Point Optimizer
              </h3>
            </div>
            <span className="text-xs text-gray-500">
              {weakBullets.length} bullet{weakBullets.length > 1 ? "s" : ""} can be improved
            </span>
          </div>

          <p className="text-xs text-gray-600 mb-4">
            ATS parsers and recruiters favor bullet points structured with: <span className="font-semibold text-gray-800">[Strong Action Verb] + [Context/Tech Stack] + [Measurable Outcome]</span>. Review and adapt these suggested rewrites:
          </p>

          <div className="space-y-4">
            {weakBullets.map((item, idx) => (
              <div key={idx} className="border border-purple-100 rounded-2xl p-4 bg-purple-50/20">
                <div className="mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                    Original Bullet ({item.reason})
                  </span>
                  <p className="text-sm text-gray-600 mt-1 pl-2 border-l-2 border-rose-300 italic">
                    "{item.original}"
                  </p>
                </div>

                <div className="mt-3 bg-white p-3 rounded-xl border border-purple-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#6A38C2] flex items-center gap-1">
                      <Sparkles size={12} /> Suggested ATS-Optimized Rewrite
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(item.suggestion, idx)}
                      className="h-7 text-xs text-[#6A38C2] hover:bg-purple-50"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check size={12} className="mr-1 text-emerald-600" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy size={12} className="mr-1" /> Copy
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-sm font-medium text-gray-800 pl-2 border-l-2 border-[#6A38C2]">
                    {item.suggestion}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. DETECTED SKILLS CHIPS */}
      <div className="bg-white rounded-3xl border border-purple-100 shadow-md p-6">
        <h3 className="font-bold text-gray-900 text-lg mb-3">Detected Keywords & Technical Vocab</h3>
        <div className="flex flex-wrap gap-2">
          {detectedKeywords.length > 0 ? (
            detectedKeywords.map((kw, idx) => (
              <Badge key={idx} className="bg-purple-100 text-[#6A38C2] hover:bg-purple-200 text-xs py-1 px-3">
                {kw}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-gray-400">No industry keywords detected yet.</span>
          )}
        </div>
      </div>

      {/* 7. OFFICIAL DISCLAIMER */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex items-start gap-3 text-xs text-gray-500">
        <Info size={16} className="text-gray-400 shrink-0 mt-0.5" />
        <p>
          {disclaimer ||
            "Disclaimer: This ATS compatibility score is an estimated indicator based on common applicant tracking system parsing heuristics. It is not an official score from an ATS vendor (like Workday, Taleo, or Greenhouse) and does not guarantee job selection."}
        </p>
      </div>
    </div>
  );
};

export default ResumeAnalyzerResult;

