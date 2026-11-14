import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  ArrowRight,
  Bookmark,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Filter,
  Loader2,
  MapPin,
  Search,
  Sparkles,
  X,
  XCircle,
} from "lucide-react";
import Navbar from "./shared/Navbar";
import useGetAppliedJobs from "@/hooks/useGetAppliedJobs";
import AppliedJobTable from "./AppliedJobTable";
import { JOB_API_ENDPOINT, USER_API_ENDPOINT } from "@/utils/constant";
import { toast } from "sonner";

const normalizeStatus = (status = "") => {
  const normalized = status.toLowerCase();
  return ({
    pending: "applied",
    "under review": "applied",
    interview: "interview scheduled",
    selected: "offer issued",
    "offer extended": "offer issued",
    hired: "offer accepted",
    accepted: "offer accepted",
    declined: "offer rejected",
  })[normalized] || normalized;
};

const metricCards = [
  { key: "total", label: "Applications", icon: BriefcaseBusiness, color: "bg-violet-50 text-violet-700" },
  { key: "shortlisted", label: "Shortlisted", icon: CheckCircle2, color: "bg-emerald-50 text-emerald-700" },
  { key: "interviews", label: "Interviews scheduled", icon: CalendarDays, color: "bg-blue-50 text-blue-700" },
  { key: "offers", label: "Offers to respond", icon: FileText, color: "bg-amber-50 text-amber-700" },
];

const StudentDashboard = () => {
  useGetAppliedJobs();
  const user = useSelector((store) => store.auth.user);
  const applications = useSelector((store) => store.job.allAppliedJobs || []);

  // Search Bar State
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [jobTypeFilter, setJobTypeFilter] = useState("all");
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const searchContainerRef = useRef(null);

  // Debounced search suggestions
  useEffect(() => {
    if (!searchTerm.trim() || searchTerm.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await axios.get(`${JOB_API_ENDPOINT}/suggestions?q=${encodeURIComponent(searchTerm.trim())}`);
        if (res.data.success) {
          setSuggestions(res.data.suggestions || []);
        }
      } catch {
        // Silently ignore suggestions failure
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleExecuteSearch = async (queryToSearch = searchTerm) => {
    const cleanQuery = (queryToSearch || "").trim();
    setShowSuggestions(false);

    if (!cleanQuery && jobTypeFilter === "all") {
      setSearchResults(null);
      setHasSearched(false);
      return;
    }

    try {
      setIsSearching(true);
      setHasSearched(true);
      const params = new URLSearchParams();
      if (cleanQuery) params.set("keyword", cleanQuery);

      const res = await axios.get(`${JOB_API_ENDPOINT}/get?${params.toString()}`);
      if (res.data.success) {
        let jobs = res.data.jobs || [];
        // Apply job type filter if selected
        if (jobTypeFilter !== "all") {
          jobs = jobs.filter((j) => (j.jobType || "").toLowerCase() === jobTypeFilter.toLowerCase());
        }
        setSearchResults(jobs);
      }
    } catch (err) {
      console.error("Student job search failed:", err);
      toast.error(err?.response?.data?.message || "Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setSuggestions([]);
    setShowSuggestions(false);
    setSearchResults(null);
    setHasSearched(false);
    setJobTypeFilter("all");
  };

  const handleSelectSuggestion = (suggestion) => {
    const clean = suggestion.startsWith("Job ID: ") ? suggestion.replace("Job ID: ", "") : suggestion;
    setSearchTerm(clean);
    setShowSuggestions(false);
    handleExecuteSearch(clean);
  };

  const summary = useMemo(() => {
    const statuses = applications.map((application) => normalizeStatus(application.status));
    return {
      total: applications.length,
      shortlisted: statuses.filter((status) => status === "shortlisted").length,
      interviews: statuses.filter((status) => status === "interview scheduled").length,
      offers: statuses.filter((status) => status === "offer issued").length,
      rejected: statuses.filter((status) => ["rejected", "interview not cleared", "offer rejected"].includes(status)).length,
    };
  }, [applications]);

  const upcomingInterviews = useMemo(() => applications
    .filter((application) =>
      application.stageDetails?.interviewDate &&
      new Date(application.stageDetails.interviewDate) >= new Date() &&
      normalizeStatus(application.status) === "interview scheduled"
    )
    .sort((left, right) =>
      new Date(left.stageDetails.interviewDate) - new Date(right.stageDetails.interviewDate)
    ), [applications]);

  if (!user || user.role !== "student") {
    return <Navigate to={user?.role === "recruiter" ? "/admin/dashboard" : "/login"} replace />;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 pb-16">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <header className="flex flex-col justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-violet-700">Student Workspace</p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                Welcome{user.fullName ? `, ${user.fullName.split(" ")[0]}` : ""}
              </h1>
              <p className="mt-1 text-sm text-slate-600">Track applications, search live jobs, and land your next role.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link to="/jobs" className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-sm hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 transition">
                <BriefcaseBusiness size={14} /> Jobs Board
              </Link>
              <Link to="/internships" className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-3.5 text-xs font-semibold text-violet-700 shadow-sm hover:bg-violet-100 transition">
                <Sparkles size={14} /> Internships
              </Link>
              <Link to="/ats-resume" className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-sm hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 transition">
                <FileText size={14} /> ATS Resume
              </Link>
              <Link to="/demo-interview" className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-violet-700 px-4 text-xs font-semibold text-white shadow-sm hover:bg-violet-800 transition">
                <CalendarDays size={14} /> Demo Interview
              </Link>
            </div>
          </header>

          {/* Prominent Student Job Search Bar */}
          <section className="mt-6 rounded-2xl border border-violet-100 bg-white p-5 sm:p-6 shadow-[0_10px_35px_rgba(109,40,217,0.06)]">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Sparkles size={16} className="text-violet-600" /> Search Active Jobs &amp; Internships
              </h2>
              {hasSearched && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="text-xs font-semibold text-violet-700 hover:underline flex items-center gap-1"
                >
                  <X size={14} /> Clear Search &amp; Show Overview
                </button>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleExecuteSearch();
              }}
              className="relative"
              ref={searchContainerRef}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-700" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Search jobs, companies, skills or locations..."
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-11 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-200"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:text-slate-600"
                      aria-label="Clear input text"
                    >
                      <X size={16} />
                    </button>
                  )}

                  {/* Real-time Debounced Search Suggestions Dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white py-2 shadow-xl">
                      <p className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">Suggestions</p>
                      {suggestions.map((item, idx) => (
                        <button
                          key={`${item}-${idx}`}
                          type="button"
                          onClick={() => handleSelectSuggestion(item)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-violet-50 hover:text-violet-800"
                        >
                          <Search size={14} className="text-violet-500 shrink-0" />
                          <span className="truncate">{item}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Job Type Filter */}
                <div className="flex items-center gap-2">
                  <select
                    value={jobTypeFilter}
                    onChange={(e) => {
                      setJobTypeFilter(e.target.value);
                      if (hasSearched) {
                        setTimeout(() => handleExecuteSearch(), 50);
                      }
                    }}
                    className="h-12 rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm text-slate-700 focus:border-violet-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-200"
                  >
                    <option value="all">All Types</option>
                    <option value="Full-Time">Full-Time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                  </select>

                  <button
                    type="submit"
                    disabled={isSearching}
                    className="inline-flex h-12 min-w-28 items-center justify-center gap-2 rounded-xl bg-violet-700 px-6 text-sm font-semibold text-white shadow-sm hover:bg-violet-800 transition disabled:opacity-60"
                  >
                    {isSearching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                    Search
                  </button>
                </div>
              </div>
            </form>

            {/* Quick search tags */}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-600">Quick filters:</span>
              {["Software Developer", "Data Analyst", "Internship", "Remote", "React", "Python"].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setSearchTerm(tag);
                    handleExecuteSearch(tag);
                  }}
                  className="rounded-full border border-slate-200 bg-white px-2.5 py-1 font-medium hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 transition"
                >
                  {tag}
                </button>
              ))}
            </div>
          </section>

          {/* Search Results Display Section */}
          {hasSearched && (
            <section aria-label="Search results" className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Search Results
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isSearching
                      ? "Searching across all database records..."
                      : `Found ${searchResults?.length || 0} active job${(searchResults?.length || 0) === 1 ? "" : "s"} matching your criteria`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-700 hover:underline self-start sm:self-auto"
                >
                  <X size={14} /> Clear Results
                </button>
              </div>

              {isSearching ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <Loader2 size={32} className="animate-spin text-violet-700 mb-2" />
                  <p className="text-sm">Searching real-time job listings...</p>
                </div>
              ) : searchResults && searchResults.length > 0 ? (
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {searchResults.map((job) => (
                    <article
                      key={job._id}
                      className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 transition duration-200 hover:-translate-y-1 hover:border-violet-300 hover:shadow-md"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            {job.company?.logo ? (
                              <img
                                src={job.company.logo}
                                alt={`${job.company?.name} logo`}
                                className="h-10 w-10 rounded-lg border border-slate-100 object-contain p-1"
                              />
                            ) : (
                              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 font-bold text-violet-700">
                                {job.company?.name?.charAt(0) || <Building2 size={18} />}
                              </span>
                            )}
                            <div>
                              <p className="text-xs font-semibold text-slate-800">{job.company?.name || "Company"}</p>
                              <p className="flex items-center gap-1 text-[11px] text-slate-500">
                                <MapPin size={11} /> {job.location || "India"}
                              </p>
                            </div>
                          </div>
                          {job.jobType && (
                            <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-[10px] font-bold text-violet-700">
                              {job.jobType}
                            </span>
                          )}
                        </div>

                        <h4 className="mt-3 font-bold text-slate-900 line-clamp-1">{job.title}</h4>
                        {job.jobId && (
                          <span className="text-[11px] font-mono text-slate-400">ID: {job.jobId}</span>
                        )}

                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                          <span className="rounded bg-slate-100 px-2 py-0.5">
                            ₹{job.salary} LPA
                          </span>
                          <span className="rounded bg-slate-100 px-2 py-0.5">
                            {job.experienceLevel} yrs exp
                          </span>
                        </div>
                      </div>

                      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">
                          {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "Recent"}
                        </span>
                        <Link
                          to={`/description/${job._id}`}
                          className="inline-flex items-center gap-1 rounded-lg bg-violet-700 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-violet-800 transition"
                        >
                          Apply Now <ArrowRight size={13} />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Search size={36} className="mx-auto text-slate-300 mb-3" />
                  <h4 className="text-base font-semibold text-slate-800">No jobs found</h4>
                  <p className="mt-1 text-sm text-slate-500">
                    No active positions matched "{searchTerm}". Try a different skill, job title, or location.
                  </p>
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="mt-4 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-violet-700 hover:bg-slate-50"
                  >
                    Reset Search
                  </button>
                </div>
              )}
            </section>
          )}

          {/* Metrics Overview */}
          <section aria-label="Application overview" className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metricCards.map(({ key, label, icon: Icon, color }) => (
              <article key={key} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-600">{label}</p>
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}><Icon size={20} /></span>
                </div>
                <p className="mt-3 text-3xl font-bold text-slate-900">{summary[key]}</p>
              </article>
            ))}
          </section>

          {summary.offers > 0 && (
            <section aria-live="polite" className="mt-6 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold text-amber-950">
                  You have {summary.offers} offer{summary.offers === 1 ? "" : "s"} awaiting your response
                </h2>
                <p className="mt-1 text-sm text-amber-800">Review the compensation and accept or reject an offer in your applications below.</p>
              </div>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-amber-800"><Clock3 size={17} /> Action required</span>
            </section>
          )}

          {summary.rejected > 0 && (
            <section className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
              <XCircle size={18} className="shrink-0 text-rose-600" />
              <span>{summary.rejected} application{summary.rejected === 1 ? "" : "s"} marked as rejected or not cleared.</span>
            </section>
          )}

          {/* Upcoming Interviews */}
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-slate-900">Upcoming interviews</h2>
                <p className="mt-1 text-sm text-slate-500">Recruiter-scheduled interviews for your applications</p>
              </div>
              <CalendarDays size={19} className="text-violet-700" />
            </div>
            {upcomingInterviews.length ? (
              <ul className="mt-4 divide-y divide-slate-100">
                {upcomingInterviews.map((application) => (
                  <li key={application._id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-slate-900">{application.job?.title || "Job interview"}</p>
                      <p className="mt-1 text-sm text-slate-500">{application.job?.company?.name || "Company"}</p>
                    </div>
                    <div className="text-sm text-slate-700 sm:text-right">
                      <p className="font-medium">{new Date(application.stageDetails.interviewDate).toLocaleString()}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {[application.stageDetails.interviewTime, application.stageDetails.interviewMode].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No upcoming interviews have been scheduled for your applications.</p>
            )}
          </section>

          {/* Application Tracking Pipeline */}
          <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold text-slate-900">Application Tracking Pipeline</h2>
                <p className="mt-1 text-sm text-slate-500">Monitor real-time progress across stages: Applied → Shortlisted → Interview → Offer Extended → Hired.</p>
              </div>
              <Link to="/profile" className="inline-flex items-center gap-1 text-sm font-semibold text-violet-700 hover:text-violet-900">
                View profile <ArrowRight size={15} />
              </Link>
            </div>
            <div className="p-4 sm:p-5">
              <AppliedJobTable />
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

export default StudentDashboard;
