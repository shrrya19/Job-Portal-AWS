import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Sparkles,
  UploadCloud,
  Edit3,
  FileText,
  Briefcase,
  ShieldCheck,
  Award,
  Zap,
  ArrowRight
} from "lucide-react";
import Navbar from "../shared/Navbar";
import Footer from "../shared/Footer";
import ResumeUpload from "./ResumeUpload";
import ResumeBuilder from "./ResumeBuilder";
import MyResumesList from "./MyResumesList";
import JobMatcher from "./JobMatcher";
import ResumeAnalyzerResult from "./ResumeAnalyzerResult";
import { Button } from "../ui/button";

const AtsResumeHub = () => {
  const { user } = useSelector((store) => store.auth) || {};
  const [activeTab, setActiveTab] = useState("upload");

  // Shared state across tabs
  const [builderData, setBuilderData] = useState(null);
  const [builderResumeId, setBuilderResumeId] = useState(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [jobMatchResumeText, setJobMatchResumeText] = useState("");
  const [jobMatchResumeData, setJobMatchResumeData] = useState(null);

  // Transfer from Upload -> Builder
  const handleTransferToBuilder = (data, id) => {
    setBuilderData(data);
    setBuilderResumeId(id || null);
    setActiveTab("builder");
  };

  // Transfer to Job Matcher
  const handleOpenJobMatcher = (content) => {
    if (typeof content === "string") {
      setJobMatchResumeText(content);
    } else {
      setJobMatchResumeData(content);
    }
    setActiveTab("job-match");
  };

  // Edit from MyResumesList
  const handleEditSavedResume = (resume) => {
    setBuilderData(resume.resumeData || null);
    setBuilderResumeId(resume._id);
    setActiveTab("builder");
  };

  // View Report from MyResumesList
  const handleViewSavedReport = (analysis) => {
    setSelectedAnalysis(analysis);
    setActiveTab("report-view");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/60 via-white to-gray-50 flex flex-col justify-between">
      <div>
        <Navbar />

        {/* HERO BANNER */}
        <section className="bg-gradient-to-r from-[#4C1D95] via-[#6A38C2] to-[#8B5CF6] text-white py-12 px-4 shadow-inner">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold text-purple-200 border border-white/20">
                <Sparkles size={14} className="text-amber-300" />
                <span>Next-Gen Student Career Tools</span>
              </div>

              <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                ATS Resume Builder & Analyzer
              </h1>

              <p className="text-purple-100 text-sm md:text-base leading-relaxed">
                Maximize your interview callbacks. Check real-time ATS compatibility scores (0–100), identify missing keywords, rewrite bullet points with action verbs, and generate downloadable professional resumes.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-center">
                <ShieldCheck size={22} className="mx-auto text-emerald-400 mb-1" />
                <span className="text-xs text-purple-200 block font-medium">ATS Parsability</span>
                <strong className="text-lg font-bold text-white">99.4% Valid</strong>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-center">
                <Zap size={22} className="mx-auto text-amber-300 mb-1" />
                <span className="text-xs text-purple-200 block font-medium">Instant Feedback</span>
                <strong className="text-lg font-bold text-white">Action Verbs</strong>
              </div>
            </div>
          </div>
        </section>

        {/* MAIN BODY CONTAINER */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* TAB NAVIGATION */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 border-b border-gray-200 pb-4 mb-8">
            <button
              onClick={() => setActiveTab("upload")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                activeTab === "upload"
                  ? "bg-[#6A38C2] text-white shadow-md scale-[1.02]"
                  : "bg-white text-gray-600 hover:bg-purple-50 hover:text-[#6A38C2] border border-gray-200"
              }`}
            >
              <UploadCloud size={16} />
              <span>Upload & Analyze</span>
            </button>

            <button
              onClick={() => setActiveTab("builder")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                activeTab === "builder"
                  ? "bg-[#6A38C2] text-white shadow-md scale-[1.02]"
                  : "bg-white text-gray-600 hover:bg-purple-50 hover:text-[#6A38C2] border border-gray-200"
              }`}
            >
              <Edit3 size={16} />
              <span>Resume Builder</span>
            </button>

            <button
              onClick={() => setActiveTab("my-resumes")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                activeTab === "my-resumes"
                  ? "bg-[#6A38C2] text-white shadow-md scale-[1.02]"
                  : "bg-white text-gray-600 hover:bg-purple-50 hover:text-[#6A38C2] border border-gray-200"
              }`}
            >
              <FileText size={16} />
              <span>My Saved Resumes</span>
            </button>

            <button
              onClick={() => setActiveTab("job-match")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                activeTab === "job-match"
                  ? "bg-[#6A38C2] text-white shadow-md scale-[1.02]"
                  : "bg-white text-gray-600 hover:bg-purple-50 hover:text-[#6A38C2] border border-gray-200"
              }`}
            >
              <Briefcase size={16} />
              <span>Job Tailoring & Match</span>
            </button>
          </div>

          {/* TAB CONTENTS */}
          {!user && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-amber-800">
                You are currently browsing as a guest. Please <Link to="/login" className="font-bold underline">log in</Link> or <Link to="/signup" className="font-bold underline">sign up</Link> to save your resumes and access personalized ATS history.
              </p>
              <Link to="/login">
                <Button size="sm" className="bg-[#6A38C2] text-white">Log In</Button>
              </Link>
            </div>
          )}

          {activeTab === "upload" && (
            <ResumeUpload
              onTransferToBuilder={handleTransferToBuilder}
              onOpenJobMatcher={handleOpenJobMatcher}
            />
          )}

          {activeTab === "builder" && (
            <ResumeBuilder
              loadedResumeData={builderData}
              loadedResumeId={builderResumeId}
              onOpenAnalysisReport={(analysis) => {
                setSelectedAnalysis(analysis);
                setActiveTab("report-view");
              }}
            />
          )}

          {activeTab === "my-resumes" && (
            <MyResumesList
              onEditResume={handleEditSavedResume}
              onViewReport={handleViewSavedReport}
              onCreateNew={() => {
                setBuilderData(null);
                setBuilderResumeId(null);
                setActiveTab("builder");
              }}
            />
          )}

          {activeTab === "job-match" && (
            <JobMatcher
              initialResumeText={jobMatchResumeText}
              initialResumeData={jobMatchResumeData}
              onSwitchToBuilder={() => setActiveTab("builder")}
            />
          )}

          {activeTab === "report-view" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("my-resumes")}
                  className="text-xs text-gray-600"
                >
                  ← Back to My Resumes
                </Button>
              </div>
              <ResumeAnalyzerResult analysis={selectedAnalysis} />
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default AtsResumeHub;

