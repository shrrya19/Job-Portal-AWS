import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Briefcase,
  Loader2,
  BookOpen,
  Sparkles,
  Info
} from "lucide-react";
import Navbar from "../shared/Navbar";
import Footer from "../shared/Footer";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { toast } from "sonner";
import { INTERVIEW_API_ENDPOINT } from "@/utils/constant";

const formatInterviewDate = (value) => {
  const [year, month, day] = new Date(value).toISOString().slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
};

const InterviewFeedback = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await axios.get(`${INTERVIEW_API_ENDPOINT}/${id}`, {
          withCredentials: true,
        });

        if (res.data?.success) {
          setInterview(res.data.interview);
        } else {
          toast.error("Failed to load interview report.");
        }
      } catch (err) {
        console.error("Error fetching interview report:", err);
        toast.error(err?.response?.data?.message || "Failed to load report.");
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
        <Navbar />
        <div className="p-16 text-center">
          <Loader2 className="mx-auto text-[#6A38C2] animate-spin mb-3" size={40} />
          <p className="text-gray-500 font-medium">Generating performance evaluation report...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!interview || !interview.evaluation) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
        <Navbar />
        <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border text-center shadow-sm">
          <AlertTriangle className="mx-auto text-amber-500 mb-3" size={40} />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Evaluation Found</h2>
          <p className="text-sm text-gray-500 mb-6">
            This interview session has not been submitted or evaluated yet.
          </p>
          <Button onClick={() => navigate("/demo-interview")} className="bg-[#6A38C2] text-white">
            Return to Demo Interview Hub
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const { evaluation } = interview;
  const overallScore = evaluation.overallScore || 0;

  const getScoreBadge = (score) => {
    if (score >= 80) return { label: "Excellent Performance", bg: "bg-emerald-100 text-emerald-800 border-emerald-300" };
    if (score >= 60) return { label: "Good - Ready with Minor Review", bg: "bg-amber-100 text-amber-800 border-amber-300" };
    return { label: "Needs Further Preparation", bg: "bg-rose-100 text-rose-800 border-rose-300" };
  };

  const badgeInfo = getScoreBadge(overallScore);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/60 via-white to-gray-50 flex flex-col justify-between">
      <div>
        <Navbar />

        <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
          {/* Top navigation back link */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/demo-interview")}
              className="text-gray-600 hover:text-gray-900 hover:bg-purple-50"
            >
              <ArrowLeft size={16} className="mr-2" /> Back to Interview Dashboard
            </Button>

            <span className="text-xs text-gray-500">
              Session ID: {interview._id.slice(-8)}
            </span>
          </div>

          {/* 1. SCORE SUMMARY HERO */}
          <div className="bg-white rounded-3xl border border-purple-100 shadow-xl p-6 md:p-10 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-purple-200/40 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
              <div className="space-y-3 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-[#6A38C2]">
                  <Sparkles size={14} /> Evaluation Feedback Report
                </div>

                <h1 className="text-3xl md:text-4xl font-black text-gray-900">
                  {interview.jobTitle}
                </h1>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs md:text-sm text-gray-600">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Briefcase size={16} className="text-[#6A38C2]" />
                    {interview.companyName}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Calendar size={16} className="text-[#6A38C2]" />
                    {formatInterviewDate(interview.scheduledDate)}
                  </span>
                  <span>•</span>
                  <span className="capitalize">{interview.interviewType} Interview</span>
                </div>
              </div>

              {/* Prominent Score Gauge */}
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full border-4 border-[#6A38C2] bg-purple-50/50 flex flex-col items-center justify-center shadow-inner">
                  <span className="text-4xl font-black text-[#6A38C2]">{overallScore}</span>
                  <span className="text-[10px] tracking-wider uppercase font-semibold text-gray-500">out of 100</span>
                </div>
                <span className={`mt-3 px-3 py-1 rounded-full text-xs font-bold border ${badgeInfo.bg}`}>
                  {badgeInfo.label}
                </span>
              </div>
            </div>

            {/* Assessment Dimensions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-100">
              <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
                <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1.5">
                  <span>Technical Knowledge</span>
                  <span className="text-[#6A38C2]">{evaluation.technicalScore || 0}%</span>
                </div>
                <div className="w-full bg-purple-200/50 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#6A38C2] h-full rounded-full transition-all duration-500"
                    style={{ width: `${evaluation.technicalScore || 0}%` }}
                  />
                </div>
              </div>

              <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1.5">
                  <span>Answer Completeness</span>
                  <span className="text-indigo-700">{evaluation.completenessScore || 0}%</span>
                </div>
                <div className="w-full bg-indigo-200/50 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${evaluation.completenessScore || 0}%` }}
                  />
                </div>
              </div>

              <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1.5">
                  <span>Clarity & Communication</span>
                  <span className="text-emerald-700">{evaluation.clarityScore || 0}%</span>
                </div>
                <div className="w-full bg-emerald-200/50 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${evaluation.clarityScore || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. STRENGTHS & AREAS TO IMPROVE */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl border border-purple-100 shadow-md p-6">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2 mb-4">
                <CheckCircle2 className="text-emerald-500" size={20} />
                <span>Areas of Strength</span>
              </h3>
              <ul className="space-y-3">
                {(evaluation.strengths || []).map((s, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-gray-700 bg-emerald-50/40 p-3 rounded-xl border border-emerald-100/60">
                    <CheckCircle2 className="text-emerald-600 shrink-0 mt-0.5" size={16} />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-3xl border border-purple-100 shadow-md p-6">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2 mb-4">
                <AlertTriangle className="text-amber-500" size={20} />
                <span>Areas for Improvement</span>
              </h3>
              <ul className="space-y-3">
                {(evaluation.improvements || []).map((imp, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-gray-700 bg-amber-50/40 p-3 rounded-xl border border-amber-100/60">
                    <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={16} />
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 3. RECOMMENDED TOPICS FOR FURTHER PREPARATION */}
          {evaluation.recommendedTopics?.length > 0 && (
            <div className="bg-gradient-to-r from-purple-50 via-white to-indigo-50 rounded-3xl border border-purple-200 shadow-md p-6">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen size={20} className="text-[#6A38C2]" />
                <h3 className="font-bold text-gray-900 text-lg">Recommended Topics for Further Study</h3>
              </div>
              <p className="text-xs text-gray-600 mb-4">
                Based on your responses and the skills in the job description for {interview.jobTitle}, focus on these key concepts:
              </p>
              <div className="flex flex-wrap gap-2">
                {evaluation.recommendedTopics.map((topic, idx) => (
                  <Badge key={idx} className="bg-purple-100 text-[#6A38C2] hover:bg-purple-200 text-xs py-1.5 px-3 rounded-xl">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* 4. QUESTION-BY-QUESTION BREAKDOWN */}
          <div className="bg-white rounded-3xl border border-purple-100 shadow-md p-6 md:p-8 space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-xl font-bold text-gray-900">Question-by-Question Detailed Review</h3>
              <p className="text-xs text-gray-500 mt-1">
                Analyze your responses, concepts covered, missing topics, and model suggestions.
              </p>
            </div>

            <div className="space-y-6">
              {(evaluation.questionFeedback || []).map((qf, idx) => {
                const questionRecord = interview.questions?.find(q => q.id === qf.questionId);
                const studentAnswer = questionRecord?.studentAnswer || "No answer recorded.";

                return (
                  <div key={idx} className="border border-purple-100 rounded-2xl p-5 bg-gray-50/30 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200/60 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#6A38C2] text-white text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <Badge className="bg-purple-100 text-[#6A38C2] text-[11px]">
                          {qf.category || "Technical"}
                        </Badge>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-gray-600">
                          Score: <span className="text-[#6A38C2] text-sm font-black">{qf.score || 0}/100</span>
                        </span>
                      </div>
                    </div>

                    <p className="text-sm font-semibold text-gray-900 leading-relaxed">
                      {qf.question || questionRecord?.question}
                    </p>

                    {/* Student's answer */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
                        Your Response
                      </span>
                      <p className="text-xs md:text-sm text-gray-700 italic leading-relaxed whitespace-pre-wrap">
                        "{studentAnswer}"
                      </p>
                    </div>

                    {/* Concepts covered & missing */}
                    <div className="grid sm:grid-cols-2 gap-3 text-xs">
                      <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                        <span className="font-bold text-emerald-800 block mb-1">
                          ✓ Key Concepts Covered:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {qf.coveredConcepts?.length > 0 ? (
                            qf.coveredConcepts.map((c, i) => (
                              <span key={i} className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[11px]">
                                {c}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 italic">None detected</span>
                          )}
                        </div>
                      </div>

                      <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                        <span className="font-bold text-amber-800 block mb-1">
                          ⚠ Concepts to Include:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {qf.missingConcepts?.length > 0 ? (
                            qf.missingConcepts.map((c, i) => (
                              <span key={i} className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[11px]">
                                {c}
                              </span>
                            ))
                          ) : (
                            <span className="text-emerald-700 italic">Comprehensive coverage!</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Feedback & Model advice */}
                    <div className="bg-purple-50/40 p-3.5 rounded-xl border border-purple-100 text-xs space-y-1.5">
                      {qf.feedback && (
                        <p className="text-gray-700">
                          <strong className="text-gray-900 font-semibold">Feedback: </strong>
                          {qf.feedback}
                        </p>
                      )}
                      {qf.modelAnswer && (
                        <p className="text-gray-600">
                          <strong className="text-[#6A38C2] font-semibold">Suggested Focus: </strong>
                          {qf.modelAnswer}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5. TRANSPARENCY DISCLAIMER */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex items-start gap-3 text-xs text-gray-500">
            <Info size={16} className="text-gray-400 shrink-0 mt-0.5" />
            <p>
              Scoring Methodology Notice: This evaluation report is generated by analyzing technical concept coverage, problem-solving depth, and responsiveness to the selected job requirements. As a self-practice demo interview, evaluation assesses written answer completeness and technical precision, without measuring spoken voice inflection or body language.
            </p>
          </div>

          {/* 6. BOTTOM ACTION BAR */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
            <Button
              variant="outline"
              onClick={() => navigate("/demo-interview")}
              className="border-purple-200 text-[#6A38C2]"
            >
              Back to My Interviews
            </Button>

            <Link to="/demo-interview">
              <Button className="bg-[#6A38C2] hover:bg-[#5B21B6] text-white shadow-md">
                Schedule Another Demo Interview
              </Button>
            </Link>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default InterviewFeedback;
