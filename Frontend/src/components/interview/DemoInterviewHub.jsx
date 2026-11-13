import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import {
  Video,
  Calendar,
  Clock,
  Sparkles,
  Award,
  CheckCircle2,
  PlayCircle,
  Plus,
  Briefcase,
  ChevronRight,
  Loader2,
} from "lucide-react";
import Navbar from "../shared/Navbar";
import Footer from "../shared/Footer";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { toast } from "sonner";
import { INTERVIEW_API_ENDPOINT } from "@/utils/constant";

const AVAILABLE_TIME_SLOTS = [
  "09:00 AM - 09:45 AM",
  "10:00 AM - 10:45 AM",
  "11:15 AM - 12:00 PM",
  "02:00 PM - 02:45 PM",
  "03:15 PM - 04:00 PM",
  "04:30 PM - 05:15 PM",
  "06:00 PM - 06:45 PM",
  "07:30 PM - 08:15 PM"
];

const toLocalDateInput = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatInterviewDate = (value) => {
  const [year, month, day] = String(value).slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
};

const DemoInterviewHub = () => {
  const { user } = useSelector((store) => store.auth) || {};
  const location = useLocation();
  const navigate = useNavigate();

  // Query parameter support (e.g. ?jobId=xyz)
  const queryParams = new URLSearchParams(location.search);
  const initialJobId = queryParams.get("jobId");

  const [activeTab, setActiveTab] = useState(initialJobId ? "schedule" : "my-interviews");

  // Dashboard Stats & Interview history
  const [interviews, setInterviews] = useState([]);
  const [stats, setStats] = useState({
    totalScheduled: 0,
    upcomingCount: 0,
    inProgressCount: 0,
    completedCount: 0,
    cancelledCount: 0,
    latestScore: null,
    avgScore: 0
  });
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Eligible jobs for scheduling
  const [eligibleJobs, setEligibleJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [jobFilter, setJobFilter] = useState("all"); // 'all' | 'applied' | 'saved'

  // Scheduling form state
  const [selectedJob, setSelectedJob] = useState(null);
  const [scheduledDate, setScheduledDate] = useState(() => toLocalDateInput());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(AVAILABLE_TIME_SLOTS[0]);
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [interviewType, setInterviewType] = useState("Mixed");
  const mode = "Self-Practice Demo";
  const [notes, setNotes] = useState("");
  const [scheduling, setScheduling] = useState(false);

  // Job preparation preview
  const [previewData, setPreviewData] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Reschedule / Cancel Modals
  const [rescheduleModal, setRescheduleModal] = useState({ open: false, interview: null, newDate: "", newSlot: "" });
  const [cancelModal, setCancelModal] = useState({ open: false, interview: null, reason: "" });
  const [modalActionLoading, setModalActionLoading] = useState(false);

  // 1. Fetch student's interview history
  const fetchMyInterviews = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const res = await axios.get(`${INTERVIEW_API_ENDPOINT}/my-interviews`, {
        withCredentials: true,
      });

      if (res.data?.success) {
        setLoadError("");
        setInterviews(res.data.interviews || []);
        if (res.data.stats) setStats(res.data.stats);
      }
    } catch (err) {
      console.error("Fetch interviews error:", err);
      setLoadError(err?.response?.data?.message || "Could not load interview sessions. Please sign in as a student and try again.");
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  const fetchJobPreview = useCallback(async (jobId, type = "Mixed") => {
    if (!jobId) return;
    setLoadingPreview(true);
    try {
      const res = await axios.get(`${INTERVIEW_API_ENDPOINT}/job/${jobId}/prepare?interviewType=${type}`, {
        withCredentials: true,
      });

      if (res.data?.success) {
        setPreviewData(res.data);
      }
    } catch (err) {
      console.error("Fetch job preview error:", err);
      toast.error(err?.response?.data?.message || "Unable to prepare questions for this job.");
    } finally {
      setLoadingPreview(false);
    }
  }, []);

  // 2. Fetch eligible jobs
  const fetchEligibleJobs = useCallback(async () => {
    setLoadingJobs(true);
    try {
      const res = await axios.get(`${INTERVIEW_API_ENDPOINT}/eligible-jobs`, {
        withCredentials: true,
      });

      if (res.data?.success) {
        setLoadError("");
        const jobs = res.data.jobs || [];
        setEligibleJobs(jobs);
        const selected = initialJobId
          ? jobs.find((job) => job._id === initialJobId)
          : jobs[0];
        if (selected) {
          setSelectedJob(selected);
          fetchJobPreview(selected._id);
        } else if (initialJobId) {
          setLoadError("The selected job is not available for interview practice.");
        }
      }
    } catch (err) {
      console.error("Fetch eligible jobs error:", err);
      setLoadError(err?.response?.data?.message || "Could not load jobs for interview practice. Please sign in as a student and try again.");
    } finally {
      setLoadingJobs(false);
    }
  }, [fetchJobPreview, initialJobId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchMyInterviews();
      fetchEligibleJobs();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchEligibleJobs, fetchMyInterviews]);

  const handleSelectJob = (job) => {
    setSelectedJob(job);
    fetchJobPreview(job._id, interviewType);
  };

  // Handle interview scheduling submission
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedJob) {
      toast.error("Please select a job for your demo interview.");
      return;
    }

    if (!scheduledDate) {
      toast.error("Please choose a date.");
      return;
    }

    // Verify date is not in the past
    if (scheduledDate < toLocalDateInput()) {
      toast.error("Cannot schedule an interview session in the past.");
      return;
    }

    setScheduling(true);
    try {
      const payload = {
        jobId: selectedJob._id,
        scheduledDate,
        timeSlot: selectedTimeSlot,
        durationMinutes,
        interviewType,
        mode,
        notes,
        timezoneOffset: new Date().getTimezoneOffset()
      };

      const res = await axios.post(`${INTERVIEW_API_ENDPOINT}/schedule`, payload, {
        withCredentials: true,
      });

      if (res.data?.success) {
        toast.success("Demo interview scheduled successfully!");
        fetchMyInterviews();
        setActiveTab("my-interviews");
      }
    } catch (err) {
      console.error("Schedule error:", err);
      toast.error(err?.response?.data?.message || "Failed to schedule interview.");
    } finally {
      setScheduling(false);
    }
  };

  // Handle reschedule
  const handleConfirmReschedule = async () => {
    if (!rescheduleModal.newDate || !rescheduleModal.newSlot) {
      toast.error("Please select a new date and time slot.");
      return;
    }

    setModalActionLoading(true);
    try {
      const res = await axios.post(
        `${INTERVIEW_API_ENDPOINT}/${rescheduleModal.interview._id}/reschedule`,
        {
          scheduledDate: rescheduleModal.newDate,
          timeSlot: rescheduleModal.newSlot,
          timezoneOffset: new Date().getTimezoneOffset()
        },
        { withCredentials: true }
      );

      if (res.data?.success) {
        toast.success("Interview rescheduled successfully!");
        setRescheduleModal({ open: false, interview: null, newDate: "", newSlot: "" });
        fetchMyInterviews();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to reschedule.");
    } finally {
      setModalActionLoading(false);
    }
  };

  // Handle cancel
  const handleConfirmCancel = async () => {
    setModalActionLoading(true);
    try {
      const res = await axios.post(
        `${INTERVIEW_API_ENDPOINT}/${cancelModal.interview._id}/cancel`,
        { reason: cancelModal.reason || "Cancelled by student" },
        { withCredentials: true }
      );

      if (res.data?.success) {
        toast.success("Interview cancelled.");
        setCancelModal({ open: false, interview: null, reason: "" });
        fetchMyInterviews();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to cancel.");
    } finally {
      setModalActionLoading(false);
    }
  };

  // Filtered jobs list
  const filteredJobs = eligibleJobs.filter((j) => {
    if (jobFilter === "applied") return j.isApplied;
    if (jobFilter === "saved") return j.isSaved;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/60 via-white to-gray-50 flex flex-col justify-between">
      <div>
        <Navbar />
        {loadError && (
          <div role="alert" className="mx-auto mt-5 max-w-7xl px-4">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              {loadError} <Link to="/login" className="font-semibold underline">Log in</Link>
            </div>
          </div>
        )}

        {/* HERO BANNER & STATS */}
        <section className="bg-gradient-to-r from-[#3B1578] via-[#5B21B6] to-[#7C3AED] text-white py-12 px-4 shadow-inner">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold text-purple-200 border border-white/20">
                <Video size={14} className="text-amber-300" />
                <span>Job-Based Mock Interview Simulation</span>
              </div>

              <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                Demo Interview Scheduling
              </h1>

              <p className="text-purple-100 text-sm md:text-base leading-relaxed">
                Practice tailored, job-specific technical and behavioral interviews derived directly from real job descriptions in the portal. Answer questions, dictate responses, and receive objective evaluation reports.
              </p>
            </div>

            {/* Dashboard Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full md:w-auto">
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-center">
                <Calendar size={20} className="mx-auto text-purple-200 mb-1" />
                <span className="text-[11px] text-purple-200 block font-medium">Scheduled</span>
                <strong className="text-xl font-bold text-white">{stats.totalScheduled}</strong>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-center">
                <CheckCircle2 size={20} className="mx-auto text-emerald-400 mb-1" />
                <span className="text-[11px] text-purple-200 block font-medium">Completed</span>
                <strong className="text-xl font-bold text-white">{stats.completedCount}</strong>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-center col-span-2 sm:col-span-1">
                <Award size={20} className="mx-auto text-amber-300 mb-1" />
                <span className="text-[11px] text-purple-200 block font-medium">Latest Score</span>
                <strong className="text-xl font-bold text-white">
                  {stats.latestScore !== null ? `${stats.latestScore}%` : "—"}
                </strong>
              </div>
            </div>
          </div>
        </section>

        {/* MAIN BODY */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* TAB CONTROLS */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4 mb-8">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveTab("my-interviews")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                  activeTab === "my-interviews"
                    ? "bg-[#6A38C2] text-white shadow-md scale-[1.02]"
                    : "bg-white text-gray-600 hover:bg-purple-50 hover:text-[#6A38C2] border border-gray-200"
                }`}
              >
                <Calendar size={16} />
                <span>My Interviews ({interviews.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("schedule")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                  activeTab === "schedule"
                    ? "bg-[#6A38C2] text-white shadow-md scale-[1.02]"
                    : "bg-white text-gray-600 hover:bg-purple-50 hover:text-[#6A38C2] border border-gray-200"
                }`}
              >
                <Plus size={16} />
                <span>Schedule New Demo Interview</span>
              </button>

              <button
                onClick={() => setActiveTab("prep")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                  activeTab === "prep"
                    ? "bg-[#6A38C2] text-white shadow-md scale-[1.02]"
                    : "bg-white text-gray-600 hover:bg-purple-50 hover:text-[#6A38C2] border border-gray-200"
                }`}
              >
                <Sparkles size={16} />
                <span>Job Question Bank & Preparation</span>
              </button>
            </div>

            {activeTab !== "schedule" && (
              <Button
                onClick={() => setActiveTab("schedule")}
                size="sm"
                className="bg-[#6A38C2] hover:bg-[#5B21B6] text-white shadow"
              >
                <Plus size={14} className="mr-1.5" /> Book a Session
              </Button>
            )}
          </div>

          {!user && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-amber-800">
                You are currently browsing as a guest. Please <Link to="/login" className="font-bold underline">log in</Link> to schedule and preserve your demo interview progress.
              </p>
              <Link to="/login">
                <Button size="sm" className="bg-[#6A38C2] text-white">Log In</Button>
              </Link>
            </div>
          )}

          {/* TAB 1: MY INTERVIEWS */}
          {activeTab === "my-interviews" && (
            <div className="space-y-6">
              {loadingHistory ? (
                <div className="bg-white rounded-3xl border border-purple-100 p-12 text-center shadow-sm">
                  <Loader2 className="mx-auto text-[#6A38C2] animate-spin mb-3" size={36} />
                  <p className="text-gray-500 font-medium">Loading your scheduled sessions...</p>
                </div>
              ) : interviews.length === 0 ? (
                <div className="bg-white rounded-3xl border border-purple-100 p-12 text-center shadow-sm max-w-lg mx-auto">
                  <div className="w-16 h-16 rounded-full bg-purple-50 text-[#6A38C2] flex items-center justify-center mx-auto mb-4">
                    <Video size={32} />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">No Demo Interviews Scheduled</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Select one of your applied or saved jobs to practice tailored technical and behavioral interview questions.
                  </p>
                  <Button
                    onClick={() => setActiveTab("schedule")}
                    className="bg-[#6A38C2] hover:bg-[#5B21B6] text-white shadow"
                  >
                    Schedule Your First Interview
                  </Button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {interviews.map((item) => {
                    const isCompleted = item.status === "Completed";
                    const isCancelled = item.status === "Cancelled";
                    const isInProgress = item.status === "In Progress";

                    const statusStyle = isCompleted
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : isCancelled
                      ? "bg-rose-50 text-rose-700 border-rose-200"
                      : isInProgress
                      ? "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
                      : "bg-purple-50 text-purple-700 border-purple-200";

                    return (
                      <div
                        key={item._id}
                        className="bg-white rounded-3xl border border-purple-100 shadow-md hover:shadow-lg transition-all p-6 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="p-3 bg-purple-50 text-[#6A38C2] rounded-2xl">
                              <Briefcase size={20} />
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusStyle}`}>
                              {item.status}
                            </span>
                          </div>

                          <h3 className="font-bold text-gray-900 text-lg line-clamp-1 mb-1">
                            {item.jobTitle}
                          </h3>
                          <p className="text-xs text-gray-500 mb-3 font-medium">
                            {item.companyName}
                          </p>

                          <div className="space-y-1.5 text-xs text-gray-600 mb-4 bg-gray-50/60 p-3 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-2">
                              <Calendar size={13} className="text-[#6A38C2]" />
                              <span>
                                {formatInterviewDate(item.scheduledDate)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock size={13} className="text-[#6A38C2]" />
                              <span>{item.timeSlot} ({item.durationMinutes} mins)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Sparkles size={13} className="text-[#6A38C2]" />
                              <span>Type: {item.interviewType} • {item.questions?.length || 0} Questions</span>
                            </div>
                          </div>

                          {isCompleted && item.evaluation && (
                            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                              <span className="text-xs font-semibold text-emerald-800">Final Score:</span>
                              <strong className="text-base text-emerald-700 font-black">
                                {item.evaluation.overallScore}/100
                              </strong>
                            </div>
                          )}

                          {isCancelled && item.cancellationReason && (
                            <p className="text-xs text-rose-500 italic mb-3">
                              Reason: {item.cancellationReason}
                            </p>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                          {isCompleted ? (
                            <Button
                              size="sm"
                              onClick={() => navigate(`/demo-interview/feedback/${item._id}`)}
                              className="w-full bg-[#6A38C2] hover:bg-[#5B21B6] text-white text-xs font-semibold"
                            >
                              <Award size={14} className="mr-1.5" /> View Evaluation Report
                            </Button>
                          ) : isCancelled ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const jobMatch = eligibleJobs.find((j) => j._id === (item.jobId?._id || item.jobId));
                                if (jobMatch) handleSelectJob(jobMatch);
                                setActiveTab("schedule");
                              }}
                              className="w-full text-xs text-gray-600 border-gray-200"
                            >
                              Book New Session
                            </Button>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                onClick={() => navigate(`/demo-interview/session/${item._id}`)}
                                className="bg-[#6A38C2] hover:bg-[#5B21B6] text-white text-xs font-semibold shadow"
                              >
                                <PlayCircle size={14} className="mr-1.5" />
                                {isInProgress ? "Resume Session" : "Start Interview"}
                              </Button>

                              <div className="flex items-center gap-1.5">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    setRescheduleModal({
                                      open: true,
                                      interview: item,
                                      newDate: item.scheduledDate.split("T")[0],
                                      newSlot: item.timeSlot
                                    })
                                  }
                                  className="h-8 text-xs text-gray-600 hover:text-purple-700"
                                >
                                  Reschedule
                                </Button>

                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setCancelModal({ open: true, interview: item, reason: "" })}
                                  className="h-8 text-xs text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SCHEDULE NEW DEMO INTERVIEW */}
          {activeTab === "schedule" && (
            <div className="grid lg:grid-cols-12 gap-8">
              {/* Left Column: Job Selector */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white rounded-3xl border border-purple-100 shadow-md p-6">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                    <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                      <Briefcase size={18} className="text-[#6A38C2]" />
                      <span>1. Select Job for Interview</span>
                    </h3>

                    {/* Filter Pills */}
                    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs">
                      <button
                        onClick={() => setJobFilter("all")}
                        className={`px-2 py-0.5 rounded-lg font-medium ${jobFilter === "all" ? "bg-white text-[#6A38C2] shadow-sm font-semibold" : "text-gray-600"}`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setJobFilter("applied")}
                        className={`px-2 py-0.5 rounded-lg font-medium ${jobFilter === "applied" ? "bg-white text-[#6A38C2] shadow-sm font-semibold" : "text-gray-600"}`}
                      >
                        Applied
                      </button>
                      <button
                        onClick={() => setJobFilter("saved")}
                        className={`px-2 py-0.5 rounded-lg font-medium ${jobFilter === "saved" ? "bg-white text-[#6A38C2] shadow-sm font-semibold" : "text-gray-600"}`}
                      >
                        Saved
                      </button>
                    </div>
                  </div>

                  {loadingJobs ? (
                    <div className="py-8 text-center text-gray-400">
                      <Loader2 size={24} className="mx-auto animate-spin mb-2 text-purple-600" />
                      <span>Loading available jobs...</span>
                    </div>
                  ) : filteredJobs.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-xs">
                      No jobs found in this category.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                      {filteredJobs.map((job) => {
                        const isSelected = selectedJob?._id === job._id;
                        return (
                          <div
                            key={job._id}
                            onClick={() => handleSelectJob(job)}
                            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                              isSelected
                                ? "border-[#6A38C2] bg-purple-50/60 shadow-sm ring-1 ring-[#6A38C2]"
                                : "border-gray-200 hover:border-purple-200 bg-white"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className="font-bold text-gray-900 text-sm line-clamp-1">
                                {job.title}
                              </h4>
                              {job.isApplied && (
                                <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">
                                  Applied
                                </span>
                              )}
                              {job.isSaved && !job.isApplied && (
                                <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">
                                  Saved
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-gray-500 font-medium mb-2">
                              {job.company?.name || "Hiring Partner"} • {job.locations?.join(", ") || job.location || "Remote"}
                            </p>

                            <div className="flex flex-wrap gap-1">
                              {(job.requirements || []).slice(0, 3).map((req, rIdx) => (
                                <span key={rIdx} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                                  {req}
                                </span>
                              ))}
                              {(job.requirements || []).length > 3 && (
                                <span className="text-[10px] text-gray-400">+{job.requirements.length - 3} more</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Scheduling Parameters */}
              <div className="lg:col-span-7 space-y-6">
                <form onSubmit={handleScheduleSubmit} className="bg-white rounded-3xl border border-purple-100 shadow-md p-6 md:p-8 space-y-6">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1">
                      2. Configure & Schedule Session
                    </h3>
                    <p className="text-xs text-gray-500">
                      {selectedJob
                        ? `Target Job: ${selectedJob.title} (${selectedJob.company?.name || "Hiring Partner"})`
                        : "Select a job from the list on the left to begin."}
                    </p>
                  </div>

                  {selectedJob && (
                    <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100 text-xs text-gray-700 space-y-1">
                      <div className="flex justify-between">
                        <strong className="text-gray-900">Required Skills:</strong>
                        <span>{(selectedJob.requirements || []).join(", ") || "General Technical"}</span>
                      </div>
                      <div className="flex justify-between">
                        <strong className="text-gray-900">Salary:</strong>
                        <span>{selectedJob.salary ? `${selectedJob.salary} LPA` : "Not disclosed"}</span>
                      </div>
                      <div className="flex justify-between">
                        <strong className="text-gray-900">Job Type:</strong>
                        <span>{selectedJob.jobType || "Full-Time"}</span>
                      </div>
                    </div>
                  )}

                  {/* Date & Time Selection */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-semibold text-gray-700">Interview Date *</Label>
                      <input
                        type="date"
                        min={toLocalDateInput()}
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        required
                        className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6A38C2]"
                      />
                    </div>

                    <div>
                      <Label className="text-xs font-semibold text-gray-700">Duration</Label>
                      <select
                        value={durationMinutes}
                        onChange={(e) => setDurationMinutes(Number(e.target.value))}
                        className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6A38C2]"
                      >
                        <option value={30}>30 Minutes (Quick Mock)</option>
                        <option value={45}>45 Minutes (Standard Interview)</option>
                        <option value={60}>60 Minutes (Deep Technical)</option>
                      </select>
                    </div>
                  </div>

                  {/* Available Time Slots */}
                  <div>
                    <Label className="text-xs font-semibold text-gray-700 block mb-2">
                      Available Time Slots * (Local Timezone)
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {AVAILABLE_TIME_SLOTS.map((slot, sIdx) => {
                        const isChosen = selectedTimeSlot === slot;
                        return (
                          <button
                            key={sIdx}
                            type="button"
                            onClick={() => setSelectedTimeSlot(slot)}
                            className={`p-2.5 rounded-xl border text-xs font-medium text-center transition-all ${
                              isChosen
                                ? "bg-[#6A38C2] text-white border-[#6A38C2] shadow-sm font-bold"
                                : "bg-white text-gray-700 border-gray-200 hover:border-purple-200"
                            }`}
                          >
                            {slot.split(" - ")[0]}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Interview Type & Mode */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-semibold text-gray-700">Interview Focus Type</Label>
                      <select
                        value={interviewType}
                        onChange={(e) => {
                          setInterviewType(e.target.value);
                          if (selectedJob) fetchJobPreview(selectedJob._id, e.target.value);
                        }}
                        className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6A38C2]"
                      >
                        <option value="Mixed">Mixed (Technical + Behavioral + HR)</option>
                        <option value="Technical">Technical Deep Dive</option>
                        <option value="Behavioral">Behavioral & Situational</option>
                        <option value="HR">HR & Culture Fit</option>
                      </select>
                    </div>

                    <div>
                      <Label className="text-xs font-semibold text-gray-700">Interview Mode</Label>
                      <div className="mt-1 p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-medium text-gray-800 flex items-center justify-between">
                        <span>Self-Practice Demo Session</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                          Interactive
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 mt-1 block">
                        Includes timer, speech-to-text dictation, and automated scoring against the job description.
                      </span>
                    </div>
                  </div>

                  {/* Preparation Notes */}
                  <div>
                    <Label className="text-xs font-semibold text-gray-700">Optional Preparation Notes</Label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Focus on Spring Boot microservices and system design trade-offs..."
                      className="mt-1 w-full p-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6A38C2]"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={scheduling || !selectedJob}
                    className="w-full bg-[#6A38C2] hover:bg-[#5B21B6] text-white font-bold py-6 rounded-2xl shadow-lg disabled:opacity-50"
                  >
                    {scheduling ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" /> Scheduling Session...
                      </>
                    ) : (
                      <>
                        <Calendar size={16} className="mr-2" /> Confirm & Schedule Demo Interview
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: QUESTION BANK & JOB PREPARATION */}
          {activeTab === "prep" && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-purple-100 shadow-md p-6 md:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4 mb-6">
                  <div>
                    <h3 className="font-bold text-gray-900 text-xl">
                      Job-Specific Preparation & Questions Preview
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {selectedJob
                        ? `Target Role: ${selectedJob.title} at ${selectedJob.company?.name || "Company"}`
                        : "Select any job to preview its tailored interview question bank."}
                    </p>
                  </div>

                  {/* Quick Job Switcher dropdown */}
                  <select
                    value={selectedJob?._id || ""}
                    onChange={(e) => {
                      const match = eligibleJobs.find((j) => j._id === e.target.value);
                      if (match) handleSelectJob(match);
                    }}
                    className="px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white"
                  >
                    {eligibleJobs.map((j) => (
                      <option key={j._id} value={j._id}>
                        {j.title} ({j.company?.name || "Company"})
                      </option>
                    ))}
                  </select>
                </div>

                {loadingPreview ? (
                  <div className="p-12 text-center text-gray-400">
                    <Loader2 size={32} className="mx-auto text-purple-600 animate-spin mb-3" />
                    <p>Generating tailored questions from job description...</p>
                  </div>
                ) : previewData?.previewQuestions?.length > 0 ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-100 mb-6">
                      <h4 className="text-xs font-bold text-[#6A38C2] uppercase tracking-wider mb-2">
                        Interview Strategy & Preparation Tips
                      </h4>
                      <ul className="space-y-1 text-xs text-gray-700">
                        {(previewData.preparationTips || []).map((tip, tIdx) => (
                          <li key={tIdx} className="flex items-start gap-2">
                            <span className="text-[#6A38C2] font-bold">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {previewData.previewQuestions.map((q, qIdx) => (
                        <div key={qIdx} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3">
                          <div className="flex items-center justify-between">
                            <Badge className="bg-purple-100 text-[#6A38C2] text-xs">
                              {q.category || "Technical"}
                            </Badge>
                            <span className="text-[11px] text-gray-400 italic">
                              {q.context}
                            </span>
                          </div>

                          <p className="text-sm font-semibold text-gray-900 leading-relaxed">
                            {q.question}
                          </p>

                          {q.suggestedConcepts?.length > 0 && (
                            <div className="pt-2 border-t border-gray-100 flex flex-wrap gap-1">
                              <span className="text-[10px] text-gray-500 font-semibold mr-1">Concepts:</span>
                              {q.suggestedConcepts.map((c, cIdx) => (
                                <span key={cIdx} className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                                  {c}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="pt-6 flex justify-end">
                      <Button
                        onClick={() => setActiveTab("schedule")}
                        className="bg-[#6A38C2] hover:bg-[#5B21B6] text-white shadow"
                      >
                        Schedule Session for this Role <ChevronRight size={16} className="ml-1" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-gray-400 py-8">Select a job to view generated questions.</p>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* RESCHEDULE MODAL */}
      {rescheduleModal.open && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-gray-900 text-lg">Reschedule Demo Interview</h3>
            <p className="text-xs text-gray-500">
              Role: {rescheduleModal.interview?.jobTitle}
            </p>

            <div className="space-y-3">
              <div>
                <Label className="text-xs font-semibold text-gray-700">New Date *</Label>
                <input
                  type="date"
                  min={toLocalDateInput()}
                  value={rescheduleModal.newDate}
                  onChange={(e) => setRescheduleModal((prev) => ({ ...prev, newDate: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-xl border"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-gray-700">New Time Slot *</Label>
                <select
                  value={rescheduleModal.newSlot}
                  onChange={(e) => setRescheduleModal((prev) => ({ ...prev, newSlot: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-xl border"
                >
                  {AVAILABLE_TIME_SLOTS.map((slot, idx) => (
                    <option key={idx} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRescheduleModal({ open: false, interview: null, newDate: "", newSlot: "" })}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={modalActionLoading}
                onClick={handleConfirmReschedule}
                className="bg-[#6A38C2] hover:bg-[#5B21B6] text-white"
              >
                {modalActionLoading ? <Loader2 size={14} className="animate-spin" /> : "Confirm Reschedule"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CANCEL MODAL */}
      {cancelModal.open && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-gray-900 text-lg">Cancel Demo Interview</h3>
            <p className="text-xs text-gray-500">
              Are you sure you want to cancel the scheduled session for <strong>{cancelModal.interview?.jobTitle}</strong>?
            </p>

            <div>
              <Label className="text-xs font-semibold text-gray-700">Reason for Cancellation</Label>
              <input
                type="text"
                placeholder="e.g. Conflict with classes, need more prep time..."
                value={cancelModal.reason}
                onChange={(e) => setCancelModal((prev) => ({ ...prev, reason: e.target.value }))}
                className="mt-1 w-full px-3 py-2 text-sm rounded-xl border"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCancelModal({ open: false, interview: null, reason: "" })}
              >
                Keep Session
              </Button>
              <Button
                size="sm"
                disabled={modalActionLoading}
                onClick={handleConfirmCancel}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                {modalActionLoading ? <Loader2 size={14} className="animate-spin" /> : "Confirm Cancellation"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default DemoInterviewHub;
