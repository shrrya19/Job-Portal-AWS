import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import {
  Save,
  Download,
  Sparkles,
  Eye,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  FileText,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { toast } from "sonner";
import { RESUME_API_ENDPOINT } from "@/utils/constant";
import ResumePreview from "./ResumePreview";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const initialResumeState = {
  personalInfo: {
    fullName: "",
    email: "",
    phoneNumber: "",
    address: "",
    linkedin: "",
    github: "",
    portfolio: ""
  },
  summary: "",
  education: [
    {
      institution: "",
      degree: "",
      fieldOfStudy: "",
      startDate: "",
      endDate: "",
      current: false,
      grade: "",
      description: ""
    }
  ],
  skills: {
    technical: [],
    soft: [],
    tools: []
  },
  experience: [
    {
      company: "",
      role: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
      bullets: [""]
    }
  ],
  projects: [
    {
      title: "",
      technologies: [],
      link: "",
      startDate: "",
      endDate: "",
      description: "",
      bullets: [""]
    }
  ],
  certifications: [
    {
      name: "",
      issuer: "",
      issueDate: "",
      credentialUrl: ""
    }
  ],
  achievements: [""],
  languages: [""],
  extracurriculars: [""]
};

const ResumeBuilder = ({
  loadedResumeData = null,
  loadedResumeId = null,
  onOpenAnalysisReport
}) => {
  const { user } = useSelector((store) => store.auth) || {};

  const [resumeId, setResumeId] = useState(loadedResumeId);
  const [title, setTitle] = useState("My Professional ATS Resume");
  const [resumeData, setResumeData] = useState(() => {
    if (loadedResumeData) return loadedResumeData;

    // Pre-populate with current student profile
    return {
      ...initialResumeState,
      personalInfo: {
        ...initialResumeState.personalInfo,
        fullName: user?.fullName || "",
        email: user?.email || "",
        phoneNumber: user?.phoneNumber ? String(user.phoneNumber) : "",
      },
      summary: user?.profile?.bio || "",
      skills: {
        ...initialResumeState.skills,
        technical: user?.profile?.skills || []
      }
    };
  });

  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [atsScore, setAtsScore] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Suggestion Modal State
  const [suggestionModal, setSuggestionModal] = useState({
    open: false,
    title: "",
    original: "",
    suggestions: [],
    targetField: null, // { section, index, subfield }
    selectedSuggestion: ""
  });

  const previewRef = useRef(null);

  useEffect(() => {
    if (loadedResumeData) {
      setResumeData(loadedResumeData);
    }
    if (loadedResumeId) {
      setResumeId(loadedResumeId);
    }
  }, [loadedResumeData, loadedResumeId]);

  // Handle personal info change
  const handlePersonalInfoChange = (field, value) => {
    setResumeData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    }));
  };

  // ================= EDUCATION HANDLERS =================
  const addEducation = () => {
    setResumeData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        { institution: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "", current: false, grade: "", description: "" }
      ]
    }));
  };

  const updateEducation = (index, field, value) => {
    setResumeData((prev) => {
      const updated = [...prev.education];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, education: updated };
    });
  };

  const removeEducation = (index) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  // ================= EXPERIENCE HANDLERS =================
  const addExperience = () => {
    setResumeData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        { company: "", role: "", location: "", startDate: "", endDate: "", current: false, description: "", bullets: [""] }
      ]
    }));
  };

  const updateExperience = (index, field, value) => {
    setResumeData((prev) => {
      const updated = [...prev.experience];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, experience: updated };
    });
  };

  const removeExperience = (index) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const addExpBullet = (expIndex) => {
    setResumeData((prev) => {
      const updated = [...prev.experience];
      updated[expIndex].bullets = [...(updated[expIndex].bullets || []), ""];
      return { ...prev, experience: updated };
    });
  };

  const updateExpBullet = (expIndex, bulletIndex, value) => {
    setResumeData((prev) => {
      const updated = [...prev.experience];
      const newBullets = [...(updated[expIndex].bullets || [])];
      newBullets[bulletIndex] = value;
      updated[expIndex].bullets = newBullets;
      return { ...prev, experience: updated };
    });
  };

  const removeExpBullet = (expIndex, bulletIndex) => {
    setResumeData((prev) => {
      const updated = [...prev.experience];
      updated[expIndex].bullets = updated[expIndex].bullets.filter((_, i) => i !== bulletIndex);
      return { ...prev, experience: updated };
    });
  };

  // ================= PROJECTS HANDLERS =================
  const addProject = () => {
    setResumeData((prev) => ({
      ...prev,
      projects: [
        ...prev.projects,
        { title: "", technologies: [], link: "", startDate: "", endDate: "", description: "", bullets: [""] }
      ]
    }));
  };

  const updateProject = (index, field, value) => {
    setResumeData((prev) => {
      const updated = [...prev.projects];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, projects: updated };
    });
  };

  const removeProject = (index) => {
    setResumeData((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }));
  };

  const addProjBullet = (projIndex) => {
    setResumeData((prev) => {
      const updated = [...prev.projects];
      updated[projIndex].bullets = [...(updated[projIndex].bullets || []), ""];
      return { ...prev, projects: updated };
    });
  };

  const updateProjBullet = (projIndex, bulletIndex, value) => {
    setResumeData((prev) => {
      const updated = [...prev.projects];
      const newBullets = [...(updated[projIndex].bullets || [])];
      newBullets[bulletIndex] = value;
      updated[projIndex].bullets = newBullets;
      return { ...prev, projects: updated };
    });
  };

  const removeProjBullet = (projIndex, bulletIndex) => {
    setResumeData((prev) => {
      const updated = [...prev.projects];
      updated[projIndex].bullets = updated[projIndex].bullets.filter((_, i) => i !== bulletIndex);
      return { ...prev, projects: updated };
    });
  };

  // ================= SKILLS HANDLERS =================
  const handleSkillsChange = (category, commaString) => {
    const list = commaString
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    setResumeData((prev) => ({
      ...prev,
      skills: { ...prev.skills, [category]: list }
    }));
  };

  // ================= CERTIFICATIONS HANDLERS =================
  const addCertification = () => {
    setResumeData((prev) => ({
      ...prev,
      certifications: [
        ...prev.certifications,
        { name: "", issuer: "", issueDate: "", credentialUrl: "" }
      ]
    }));
  };

  const updateCertification = (index, field, value) => {
    setResumeData((prev) => {
      const updated = [...prev.certifications];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, certifications: updated };
    });
  };

  const removeCertification = (index) => {
    setResumeData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  // ================= AI / HEURISTIC TEXT SUGGESTIONS =================
  const requestSuggestion = async (text, type, target) => {
    if (!text || !text.trim()) {
      toast.error("Please enter some text first to generate optimization suggestions.");
      return;
    }

    try {
      const res = await axios.post(
        `${RESUME_API_ENDPOINT}/improve-text`,
        { text, type },
        { withCredentials: true }
      );

      if (res.data?.success && res.data.result?.suggestions?.length > 0) {
        setSuggestionModal({
          open: true,
          title: type === "summary" ? "Optimize Professional Summary" : "Optimize Bullet Point",
          original: text,
          suggestions: res.data.result.suggestions,
          targetField: target,
          selectedSuggestion: res.data.result.suggestions[0]
        });
      } else {
        toast.error("Could not generate suggestions for this item.");
      }
    } catch (err) {
      console.error("Suggestion error:", err);
      toast.error(err?.response?.data?.message || "Failed to fetch suggestions.");
    }
  };

  const applySuggestion = () => {
    const { targetField, selectedSuggestion } = suggestionModal;
    if (!selectedSuggestion) return;

    if (targetField.section === "summary") {
      setResumeData((prev) => ({ ...prev, summary: selectedSuggestion }));
    } else if (targetField.section === "expBullet") {
      updateExpBullet(targetField.expIndex, targetField.bulletIndex, selectedSuggestion);
    } else if (targetField.section === "projBullet") {
      updateProjBullet(targetField.projIndex, targetField.bulletIndex, selectedSuggestion);
    }

    toast.success("Applied optimization to resume!");
    setSuggestionModal({ open: false, title: "", original: "", suggestions: [], targetField: null, selectedSuggestion: "" });
  };

  // ================= SAVE RESUME DRAFT =================
  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const payload = {
        resumeId: resumeId || undefined,
        title,
        resumeData
      };

      const res = await axios.post(`${RESUME_API_ENDPOINT}/save`, payload, {
        withCredentials: true
      });

      if (res.data?.success) {
        toast.success("Resume saved successfully!");
        if (res.data.resume?._id) {
          setResumeId(res.data.resume._id);
        }
        if (res.data.analysis?.score) {
          setAtsScore(res.data.analysis.score);
        }
      } else {
        toast.error(res.data?.message || "Failed to save resume draft.");
      }
    } catch (err) {
      console.error("Save draft error:", err);
      toast.error(err?.response?.data?.message || "Failed to save draft. Make sure you are logged in.");
    } finally {
      setSaving(false);
    }
  };

  // ================= RUN ATS ANALYSIS =================
  const handleAnalyzeResume = async () => {
    setAnalyzing(true);
    try {
      const res = await axios.post(
        `${RESUME_API_ENDPOINT}/analyze`,
        { resumeData, resumeId },
        { withCredentials: true }
      );

      if (res.data?.success) {
        setAtsScore(res.data.analysis.score);
        toast.success(`ATS Compatibility Score: ${res.data.analysis.score}/100`);
        if (onOpenAnalysisReport) {
          onOpenAnalysisReport(res.data.analysis);
        }
      } else {
        toast.error(res.data?.message || "Analysis failed.");
      }
    } catch (err) {
      console.error("Analyze error:", err);
      toast.error(err?.response?.data?.message || "Failed to analyze resume.");
    } finally {
      setAnalyzing(false);
    }
  };

  // ================= DOWNLOAD PDF =================
  const handleDownloadPDF = async () => {
    setDownloading(true);
    toast.info("Generating professional ATS-friendly PDF...");

    try {
      const docElement = document.getElementById("resume-preview-document");
      if (!docElement) {
        // Fallback: window.print
        window.print();
        setDownloading(false);
        return;
      }

      const canvas = await html2canvas(docElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff"
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210; // A4 width mm
      const pageHeight = 295; // A4 height mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const safeName = (resumeData.personalInfo.fullName || "Resume").replace(/[^a-zA-Z0-9]/g, "_");
      pdf.save(`${safeName}_ATS_Resume.pdf`);
      toast.success("Resume downloaded successfully!");
    } catch (pdfErr) {
      console.error("PDF generation failed:", pdfErr);
      toast.error("Vector PDF export had an issue. Opening browser print dialog as fallback.");
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* BUILDER ACTION BAR */}
      <div className="bg-white rounded-3xl border border-purple-100 shadow-md p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-[75px] z-20 backdrop-blur-md bg-white/95">
        <div className="w-full md:w-auto">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg md:text-xl font-bold text-gray-900 border-b border-transparent hover:border-gray-300 focus:border-[#6A38C2] focus:outline-none px-1 py-0.5 rounded w-full md:w-80"
            placeholder="Resume Document Title"
          />
          <p className="text-xs text-gray-500 mt-0.5">
            Single-Column ATS-Compliant Template
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {atsScore !== null && (
            <div
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
                atsScore >= 80
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                  : atsScore >= 60
                  ? "bg-amber-50 text-amber-700 border-amber-300"
                  : "bg-rose-50 text-rose-700 border-rose-300"
              }`}
            >
              <Sparkles size={14} />
              <span>ATS Score: {atsScore}/100</span>
            </div>
          )}

          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
            className="border-purple-200 text-[#6A38C2] hover:bg-purple-50"
          >
            <Eye size={16} className="mr-1.5" />
            {showPreview ? "Hide Preview" : "Live Preview"}
          </Button>

          <Button
            variant="outline"
            onClick={handleAnalyzeResume}
            disabled={analyzing}
            className="border-[#6A38C2] text-[#6A38C2] hover:bg-purple-50"
          >
            {analyzing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} className="mr-1.5" />}
            Analyze ATS
          </Button>

          <Button
            onClick={handleSaveDraft}
            disabled={saving}
            className="bg-[#6A38C2] hover:bg-[#5B21B6] text-white shadow"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} className="mr-1.5" />}
            Save Draft
          </Button>

          <Button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow"
          >
            {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} className="mr-1.5" />}
            Download PDF
          </Button>
        </div>
      </div>

      {/* MAIN TWO-COLUMN / FORM VIEW */}
      <div className={`grid ${showPreview ? "lg:grid-cols-2" : "grid-cols-1"} gap-8`}>
        {/* FORM CONTAINER */}
        <div className="space-y-6">
          {/* 1. PERSONAL INFORMATION */}
          <div className="bg-white rounded-3xl border border-purple-100 shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4">
              1. Personal & Contact Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold text-gray-700">Full Name *</Label>
                <input
                  type="text"
                  value={resumeData.personalInfo.fullName}
                  onChange={(e) => handlePersonalInfoChange("fullName", e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6A38C2]"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-gray-700">Professional Email *</Label>
                <input
                  type="email"
                  value={resumeData.personalInfo.email}
                  onChange={(e) => handlePersonalInfoChange("email", e.target.value)}
                  placeholder="e.g. jane.doe@example.com"
                  className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6A38C2]"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-gray-700">Phone Number *</Label>
                <input
                  type="text"
                  value={resumeData.personalInfo.phoneNumber}
                  onChange={(e) => handlePersonalInfoChange("phoneNumber", e.target.value)}
                  placeholder="e.g. +1 (555) 234-5678"
                  className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6A38C2]"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-gray-700">Location / City, Country</Label>
                <input
                  type="text"
                  value={resumeData.personalInfo.address}
                  onChange={(e) => handlePersonalInfoChange("address", e.target.value)}
                  placeholder="e.g. Seattle, WA"
                  className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6A38C2]"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-gray-700">LinkedIn Profile URL</Label>
                <input
                  type="text"
                  value={resumeData.personalInfo.linkedin}
                  onChange={(e) => handlePersonalInfoChange("linkedin", e.target.value)}
                  placeholder="linkedin.com/in/janedoe"
                  className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6A38C2]"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-gray-700">GitHub / Portfolio URL</Label>
                <input
                  type="text"
                  value={resumeData.personalInfo.github}
                  onChange={(e) => handlePersonalInfoChange("github", e.target.value)}
                  placeholder="github.com/janedoe"
                  className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6A38C2]"
                />
              </div>
            </div>
          </div>

          {/* 2. PROFESSIONAL SUMMARY */}
          <div className="bg-white rounded-3xl border border-purple-100 shadow-md p-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                2. Professional Summary or Career Objective
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => requestSuggestion(resumeData.summary, "summary", { section: "summary" })}
                className="text-xs text-[#6A38C2] hover:bg-purple-50"
              >
                <Sparkles size={14} className="mr-1" /> Polish Summary
              </Button>
            </div>

            <textarea
              rows={4}
              value={resumeData.summary}
              onChange={(e) => setResumeData((prev) => ({ ...prev, summary: e.target.value }))}
              placeholder="Write a 2-3 sentence overview of your career focus, core skills, and technical impact..."
              className="w-full p-3 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6A38C2] leading-relaxed"
            />
          </div>

          {/* 3. TECHNICAL & SOFT SKILLS */}
          <div className="bg-white rounded-3xl border border-purple-100 shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4">
              3. Technical & Soft Skills
            </h3>

            <div className="space-y-4">
              <div>
                <Label className="text-xs font-semibold text-gray-700">
                  Programming Languages & Frameworks (comma separated)
                </Label>
                <input
                  type="text"
                  value={(resumeData.skills?.technical || []).join(", ")}
                  onChange={(e) => handleSkillsChange("technical", e.target.value)}
                  placeholder="JavaScript, TypeScript, React, Node.js, Python, MongoDB"
                  className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6A38C2]"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-gray-700">
                  Developer Tools, Cloud & Databases (comma separated)
                </Label>
                <input
                  type="text"
                  value={(resumeData.skills?.tools || []).join(", ")}
                  onChange={(e) => handleSkillsChange("tools", e.target.value)}
                  placeholder="Git, Docker, AWS S3, EC2, PostgreSQL, Redis, Postman"
                  className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6A38C2]"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-gray-700">
                  Core Competencies & Soft Skills (comma separated)
                </Label>
                <input
                  type="text"
                  value={(resumeData.skills?.soft || []).join(", ")}
                  onChange={(e) => handleSkillsChange("soft", e.target.value)}
                  placeholder="Problem Solving, Agile Methodology, Cross-functional Collaboration"
                  className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6A38C2]"
                />
              </div>
            </div>
          </div>

          {/* 4. WORK EXPERIENCE & INTERNSHIPS */}
          <div className="bg-white rounded-3xl border border-purple-100 shadow-md p-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                4. Experience & Internships
              </h3>
              <Button
                size="sm"
                variant="outline"
                onClick={addExperience}
                className="text-xs border-purple-200 text-[#6A38C2] hover:bg-purple-50"
              >
                <Plus size={14} className="mr-1" /> Add Experience
              </Button>
            </div>

            <div className="space-y-6">
              {resumeData.experience.map((exp, expIdx) => (
                <div key={expIdx} className="p-4 rounded-2xl border border-gray-200 bg-gray-50/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
                      Position #{expIdx + 1}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeExperience(expIdx)}
                      className="h-7 text-xs text-rose-500 hover:bg-rose-50"
                    >
                      <Trash2 size={13} className="mr-1" /> Remove
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-medium text-gray-600">Company Name *</Label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => updateExperience(expIdx, "company", e.target.value)}
                        placeholder="e.g. Acme Corp"
                        className="mt-0.5 w-full px-3 py-1.5 text-sm rounded-xl border border-gray-200 bg-white"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-gray-600">Role / Title *</Label>
                      <input
                        type="text"
                        value={exp.role}
                        onChange={(e) => updateExperience(expIdx, "role", e.target.value)}
                        placeholder="e.g. Software Engineer Intern"
                        className="mt-0.5 w-full px-3 py-1.5 text-sm rounded-xl border border-gray-200 bg-white"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-gray-600">Duration (e.g. May 2024 - Aug 2024)</Label>
                      <input
                        type="text"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(expIdx, "startDate", e.target.value)}
                        placeholder="e.g. June 2024 – Present"
                        className="mt-0.5 w-full px-3 py-1.5 text-sm rounded-xl border border-gray-200 bg-white"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-gray-600">Location</Label>
                      <input
                        type="text"
                        value={exp.location}
                        onChange={(e) => updateExperience(expIdx, "location", e.target.value)}
                        placeholder="e.g. San Francisco, CA (or Remote)"
                        className="mt-0.5 w-full px-3 py-1.5 text-sm rounded-xl border border-gray-200 bg-white"
                      />
                    </div>
                  </div>

                  {/* Bullet points */}
                  <div className="pt-2">
                    <Label className="text-xs font-semibold text-gray-700 block mb-1">
                      Achievement Bullet Points (Include Action Verbs & Metrics)
                    </Label>
                    <div className="space-y-2">
                      {(exp.bullets || [""]).map((bullet, bIdx) => (
                        <div key={bIdx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={bullet}
                            onChange={(e) => updateExpBullet(expIdx, bIdx, e.target.value)}
                            placeholder="e.g. Engineered RESTful APIs reducing query latency by 30%..."
                            className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-white"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              requestSuggestion(bullet, "bullet", {
                                section: "expBullet",
                                expIndex: expIdx,
                                bulletIndex: bIdx
                              })
                            }
                            className="h-8 px-2 text-[#6A38C2] hover:bg-purple-100/50"
                            title="Improve with Action Verbs"
                          >
                            <Sparkles size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeExpBullet(expIdx, bIdx)}
                            className="h-8 px-2 text-gray-400 hover:text-rose-500"
                          >
                            <Trash2 size={13} />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => addExpBullet(expIdx)}
                      className="mt-2 text-xs text-[#6A38C2] hover:bg-purple-50"
                    >
                      <Plus size={12} className="mr-1" /> Add Bullet Point
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. PROJECTS */}
          <div className="bg-white rounded-3xl border border-purple-100 shadow-md p-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h3 className="text-lg font-bold text-gray-900">5. Technical Projects</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={addProject}
                className="text-xs border-purple-200 text-[#6A38C2] hover:bg-purple-50"
              >
                <Plus size={14} className="mr-1" /> Add Project
              </Button>
            </div>

            <div className="space-y-6">
              {resumeData.projects.map((proj, projIdx) => (
                <div key={projIdx} className="p-4 rounded-2xl border border-gray-200 bg-gray-50/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
                      Project #{projIdx + 1}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeProject(projIdx)}
                      className="h-7 text-xs text-rose-500 hover:bg-rose-50"
                    >
                      <Trash2 size={13} className="mr-1" /> Remove
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-medium text-gray-600">Project Title *</Label>
                      <input
                        type="text"
                        value={proj.title}
                        onChange={(e) => updateProject(projIdx, "title", e.target.value)}
                        placeholder="e.g. Student Job Portal"
                        className="mt-0.5 w-full px-3 py-1.5 text-sm rounded-xl border border-gray-200 bg-white"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-gray-600">Technologies Used (comma separated)</Label>
                      <input
                        type="text"
                        value={(proj.technologies || []).join(", ")}
                        onChange={(e) =>
                          updateProject(
                            projIdx,
                            "technologies",
                            e.target.value.split(",").map((t) => t.trim()).filter(Boolean)
                          )
                        }
                        placeholder="e.g. React, Node.js, Express, MongoDB"
                        className="mt-0.5 w-full px-3 py-1.5 text-sm rounded-xl border border-gray-200 bg-white"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label className="text-xs font-medium text-gray-600">Project Demo / GitHub URL</Label>
                      <input
                        type="text"
                        value={proj.link}
                        onChange={(e) => updateProject(projIdx, "link", e.target.value)}
                        placeholder="https://github.com/janedoe/job-portal"
                        className="mt-0.5 w-full px-3 py-1.5 text-sm rounded-xl border border-gray-200 bg-white"
                      />
                    </div>
                  </div>

                  {/* Bullet points */}
                  <div className="pt-2">
                    <Label className="text-xs font-semibold text-gray-700 block mb-1">
                      Project Bullets (Action + Metric)
                    </Label>
                    <div className="space-y-2">
                      {(proj.bullets || [""]).map((bullet, bIdx) => (
                        <div key={bIdx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={bullet}
                            onChange={(e) => updateProjBullet(projIdx, bIdx, e.target.value)}
                            placeholder="e.g. Built automated ATS scoring algorithm utilizing NLP tokenization..."
                            className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-white"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              requestSuggestion(bullet, "bullet", {
                                section: "projBullet",
                                projIndex: projIdx,
                                bulletIndex: bIdx
                              })
                            }
                            className="h-8 px-2 text-[#6A38C2] hover:bg-purple-100/50"
                            title="Improve with Action Verbs"
                          >
                            <Sparkles size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeProjBullet(projIdx, bIdx)}
                            className="h-8 px-2 text-gray-400 hover:text-rose-500"
                          >
                            <Trash2 size={13} />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => addProjBullet(projIdx)}
                      className="mt-2 text-xs text-[#6A38C2] hover:bg-purple-50"
                    >
                      <Plus size={12} className="mr-1" /> Add Project Bullet
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 6. EDUCATION */}
          <div className="bg-white rounded-3xl border border-purple-100 shadow-md p-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h3 className="text-lg font-bold text-gray-900">6. Education & Qualifications</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={addEducation}
                className="text-xs border-purple-200 text-[#6A38C2] hover:bg-purple-50"
              >
                <Plus size={14} className="mr-1" /> Add Education
              </Button>
            </div>

            <div className="space-y-4">
              {resumeData.education.map((edu, eduIdx) => (
                <div key={eduIdx} className="p-4 rounded-2xl border border-gray-200 bg-gray-50/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
                      Degree #{eduIdx + 1}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeEducation(eduIdx)}
                      className="h-7 text-xs text-rose-500 hover:bg-rose-50"
                    >
                      <Trash2 size={13} className="mr-1" /> Remove
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-medium text-gray-600">Institution / University *</Label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => updateEducation(eduIdx, "institution", e.target.value)}
                        placeholder="e.g. Stanford University"
                        className="mt-0.5 w-full px-3 py-1.5 text-sm rounded-xl border border-gray-200 bg-white"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-gray-600">Degree & Major *</Label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => updateEducation(eduIdx, "degree", e.target.value)}
                        placeholder="e.g. B.S. in Computer Science"
                        className="mt-0.5 w-full px-3 py-1.5 text-sm rounded-xl border border-gray-200 bg-white"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-gray-600">Graduation Year / Dates</Label>
                      <input
                        type="text"
                        value={edu.startDate}
                        onChange={(e) => updateEducation(eduIdx, "startDate", e.target.value)}
                        placeholder="e.g. 2021 – 2025"
                        className="mt-0.5 w-full px-3 py-1.5 text-sm rounded-xl border border-gray-200 bg-white"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-gray-600">GPA / Percentage</Label>
                      <input
                        type="text"
                        value={edu.grade}
                        onChange={(e) => updateEducation(eduIdx, "grade", e.target.value)}
                        placeholder="e.g. 3.8 / 4.0 GPA"
                        className="mt-0.5 w-full px-3 py-1.5 text-sm rounded-xl border border-gray-200 bg-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 7. CERTIFICATIONS & ACHIEVEMENTS */}
          <div className="bg-white rounded-3xl border border-purple-100 shadow-md p-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h3 className="text-lg font-bold text-gray-900">7. Certifications & Achievements</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={addCertification}
                className="text-xs border-purple-200 text-[#6A38C2] hover:bg-purple-50"
              >
                <Plus size={14} className="mr-1" /> Add Certification
              </Button>
            </div>

            <div className="space-y-4">
              {resumeData.certifications.map((cert, certIdx) => (
                <div key={certIdx} className="p-3 rounded-xl border border-gray-200 bg-gray-50/40 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                  <input
                    type="text"
                    value={cert.name}
                    onChange={(e) => updateCertification(certIdx, "name", e.target.value)}
                    placeholder="Certification Name"
                    className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-white"
                  />
                  <input
                    type="text"
                    value={cert.issuer}
                    onChange={(e) => updateCertification(certIdx, "issuer", e.target.value)}
                    placeholder="Issuing Organization (e.g. AWS)"
                    className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-white"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={cert.issueDate}
                      onChange={(e) => updateCertification(certIdx, "issueDate", e.target.value)}
                      placeholder="Year (e.g. 2024)"
                      className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-white flex-1"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeCertification(certIdx)}
                      className="h-7 w-7 p-0 text-gray-400 hover:text-rose-500"
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* LIVE ATS PREVIEW CONTAINER */}
        {showPreview && (
          <div className="lg:sticky lg:top-[160px] h-fit">
            <div className="mb-2 flex items-center justify-between text-xs text-gray-500 px-2">
              <span className="font-semibold text-gray-700 flex items-center gap-1.5">
                <FileText size={14} className="text-[#6A38C2]" /> Real-Time ATS Render
              </span>
              <span>100% ATS Single-Column Layout</span>
            </div>
            <div className="overflow-auto max-h-[85vh] border rounded-3xl shadow-xl bg-gray-100 p-4">
              <ResumePreview ref={previewRef} resumeData={resumeData} />
            </div>
          </div>
        )}
      </div>

      {/* SUGGESTION / OPTIMIZATION MODAL */}
      {suggestionModal.open && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-purple-100 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <Sparkles className="text-[#6A38C2]" size={18} />
                {suggestionModal.title}
              </h3>
              <button
                onClick={() => setSuggestionModal((prev) => ({ ...prev, open: false }))}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-xs font-semibold text-gray-500 block mb-1">Original Content:</span>
                <p className="text-xs bg-gray-50 p-2.5 rounded-xl border italic text-gray-700">
                  "{suggestionModal.original}"
                </p>
              </div>

              <div>
                <span className="text-xs font-semibold text-gray-700 block mb-2">
                  Select or Edit an ATS-Optimized Variation:
                </span>
                <div className="space-y-2">
                  {suggestionModal.suggestions.map((sug, idx) => (
                    <div
                      key={idx}
                      onClick={() =>
                        setSuggestionModal((prev) => ({ ...prev, selectedSuggestion: sug }))
                      }
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        suggestionModal.selectedSuggestion === sug
                          ? "border-[#6A38C2] bg-purple-50 text-purple-900 font-medium"
                          : "border-gray-200 hover:border-purple-200 text-gray-700"
                      }`}
                    >
                      {sug}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold text-gray-700">
                  Custom Review & Edit:
                </Label>
                <textarea
                  rows={3}
                  value={suggestionModal.selectedSuggestion}
                  onChange={(e) =>
                    setSuggestionModal((prev) => ({ ...prev, selectedSuggestion: e.target.value }))
                  }
                  className="mt-1 w-full p-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6A38C2]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSuggestionModal((prev) => ({ ...prev, open: false }))}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={applySuggestion}
                className="bg-[#6A38C2] hover:bg-[#5B21B6] text-white shadow"
              >
                Apply to Resume
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeBuilder;

