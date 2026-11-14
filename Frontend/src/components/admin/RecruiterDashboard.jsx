import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Edit,
  Eye,
  Filter,
  Loader2,
  Mail,
  MapPin,
  Plus,
  Search,
  Sparkles,
  UserRoundCheck,
  Users,
  X,
  XCircle,
} from "lucide-react";
import Navbar from "../shared/Navbar";
import { RECRUITER_API_ENDPOINT } from "@/utils/constant";
import { toast } from "sonner";

const metricCards = [
  { key: "totalJobs", label: "Total jobs posted", icon: BriefcaseBusiness, color: "bg-violet-50 text-violet-700" },
  { key: "activeJobs", label: "Active jobs", icon: CheckCircle2, color: "bg-emerald-50 text-emerald-700" },
  { key: "inactiveJobs", label: "Inactive jobs", icon: XCircle, color: "bg-slate-100 text-slate-700" },
  { key: "expiredJobs", label: "Expired jobs", icon: CalendarDays, color: "bg-orange-50 text-orange-700" },
  { key: "totalApplications", label: "Applications received", icon: Users, color: "bg-blue-50 text-blue-700" },
  { key: "shortlistedCandidates", label: "Shortlisted", icon: UserRoundCheck, color: "bg-amber-50 text-amber-700" },
  { key: "rejectedCandidates", label: "Rejected", icon: XCircle, color: "bg-rose-50 text-rose-700" },
  { key: "upcomingInterviews", label: "Upcoming interviews", icon: Clock3, color: "bg-cyan-50 text-cyan-700" },
];

const statusClass = {
  applied: "bg-slate-100 text-slate-700",
  "under review": "bg-blue-50 text-blue-700",
  shortlisted: "bg-amber-50 text-amber-700",
  "interview scheduled": "bg-violet-50 text-violet-700",
  selected: "bg-emerald-50 text-emerald-700",
  rejected: "bg-rose-50 text-rose-700",
};

const RecruiterDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeSearchTab, setActiveSearchTab] = useState("all"); // 'all' | 'jobs' | 'applicants'
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    axios.get(`${RECRUITER_API_ENDPOINT}/dashboard`, {
      withCredentials: true,
      signal: controller.signal,
    })
      .then(({ data }) => {
        if (!data.success) throw new Error("Unable to load recruiter analytics.");
        setDashboard(data);
      })
      .catch((requestError) => {
        if (controller.signal.aborted) return;
        console.error("Recruiter dashboard loading failed:", requestError);
        setError(requestError?.response?.data?.message || requestError.message || "Unable to load dashboard data.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  const handleExecuteSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchTerm.trim() && statusFilter === "all") {
      setSearchResults(null);
      setHasSearched(false);
      return;
    }

    try {
      setIsSearching(true);
      setHasSearched(true);
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.set("query", searchTerm.trim());
      if (statusFilter !== "all") params.set("status", statusFilter);

      const res = await axios.get(`${RECRUITER_API_ENDPOINT}/search?${params.toString()}`, {
        withCredentials: true,
      });

      if (res.data.success) {
        setSearchResults(res.data);
      }
    } catch (err) {
      console.error("Recruiter search failed:", err);
      toast.error(err?.response?.data?.message || "Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSearchResults(null);
    setHasSearched(false);
    setActiveSearchTab("all");
  };

  const trend = dashboard?.applicationTrend || [];
  const maxApplications = Math.max(...trend.map((item) => item.applications), 1);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 pb-16">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <header className="flex flex-col justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-violet-700">Recruiter Workspace</p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
              <p className="mt-1 text-sm text-slate-600">Your recruiting activity, candidates, and job postings.</p>
            </div>
            <Link to="/admin/jobs/create" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 text-sm font-semibold text-white shadow-sm hover:bg-violet-800 transition">
              <Plus size={17} /> Post a New Job
            </Link>
          </header>

          {/* Prominent Recruiter Search Bar */}
          <section className="mt-6 rounded-2xl border border-violet-100 bg-white p-5 sm:p-6 shadow-[0_10px_35px_rgba(109,40,217,0.06)]">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Search size={16} className="text-violet-600" /> Search Your Jobs &amp; Applicants
              </h2>
              {hasSearched && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="text-xs font-semibold text-violet-700 hover:underline flex items-center gap-1"
                >
                  <X size={14} /> Clear Search &amp; Show Analytics
                </button>
              )}
            </div>

            <form onSubmit={handleExecuteSearch} className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-700" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search your jobs, job ID or applicants..."
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
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-12 rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm text-slate-700 focus:border-violet-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-200"
                >
                  <option value="all">All Statuses</option>
                  <option value="Active">Active Jobs</option>
                  <option value="Inactive">Inactive Jobs</option>
                  <option value="Expired">Expired Jobs</option>
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
            </form>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Sparkles size={13} className="text-violet-600" />
                <span>Search by job title, custom Job ID, location, candidate name, email, or application ID.</span>
              </span>
              <span className="hidden sm:inline font-medium text-slate-400">Strictly authorized to your company's records</span>
            </div>
          </section>

          {/* Recruiter Search Results Section */}
          {hasSearched && (
            <section aria-label="Recruiter search results" className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Search Results</h3>
                  <p className="text-xs text-slate-500">
                    {isSearching ? "Searching your company's records..." : `Found ${searchResults?.totalJobs || 0} matching jobs and ${searchResults?.totalApplicants || 0} matching applicants`}
                  </p>
                </div>

                {/* Sub-tab switcher */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveSearchTab("all")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${activeSearchTab === "all" ? "bg-violet-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                  >
                    All ({((searchResults?.totalJobs || 0) + (searchResults?.totalApplicants || 0))})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSearchTab("jobs")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${activeSearchTab === "jobs" ? "bg-violet-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                  >
                    Jobs ({searchResults?.totalJobs || 0})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSearchTab("applicants")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${activeSearchTab === "applicants" ? "bg-violet-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                  >
                    Applicants ({searchResults?.totalApplicants || 0})
                  </button>
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="ml-2 text-xs font-semibold text-slate-400 hover:text-slate-600"
                  >
                    Close
                  </button>
                </div>
              </div>

              {isSearching ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <Loader2 size={32} className="animate-spin text-violet-700 mb-2" />
                  <p className="text-sm">Searching your private company records...</p>
                </div>
              ) : (
                <div className="mt-6 space-y-8">
                  {/* Matching Jobs List */}
                  {(activeSearchTab === "all" || activeSearchTab === "jobs") && (
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center justify-between">
                        <span>Matching Jobs ({searchResults?.jobs?.length || 0})</span>
                        <Link to="/admin/jobs" className="text-xs font-medium text-violet-700 hover:underline">Manage All Jobs &rarr;</Link>
                      </h4>

                      {searchResults?.jobs?.length > 0 ? (
                        <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden">
                          {searchResults.jobs.map((job) => (
                            <div key={job._id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-slate-50 transition">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h5 className="font-bold text-slate-900">{job.title}</h5>
                                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${job.status === "Inactive" ? "bg-slate-100 text-slate-600" : job.status === "Expired" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                                    {job.status || "Active"}
                                  </span>
                                </div>
                                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                  {job.jobId && <span className="font-mono text-slate-700 font-semibold">ID: {job.jobId}</span>}
                                  <span>{job.company?.name || "Company"}</span>
                                  <span>{job.location}</span>
                                  <span>Posted: {new Date(job.createdAt).toLocaleDateString()}</span>
                                  <span className="font-semibold text-violet-700">{job.applicationCount || 0} Applications</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 self-start sm:self-auto">
                                <Link
                                  to={`/admin/jobs/${job._id}/applicants`}
                                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                                >
                                  <Eye size={13} /> View Applicants
                                </Link>
                                <Link
                                  to={`/admin/jobs/edit/${job._id}`}
                                  className="inline-flex items-center gap-1 rounded-lg bg-violet-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-800"
                                >
                                  <Edit size={13} /> Edit Job
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">
                          No jobs matched this search term.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Matching Applicants List */}
                  {(activeSearchTab === "all" || activeSearchTab === "applicants") && (
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center justify-between">
                        <span>Matching Applicants ({searchResults?.applicants?.length || 0})</span>
                      </h4>

                      {searchResults?.applicants?.length > 0 ? (
                        <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden">
                          {searchResults.applicants.map((app) => (
                            <div key={app._id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-slate-50 transition">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h5 className="font-bold text-slate-900">{app.applicant?.fullName || "Candidate"}</h5>
                                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold capitalize ${statusClass[app.status] || statusClass.applied}`}>
                                    {app.status}
                                  </span>
                                </div>
                                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                  <span>{app.applicant?.email}</span>
                                  {app.applicant?.phoneNumber && <span>{app.applicant.phoneNumber}</span>}
                                  <span className="font-semibold text-slate-700">Applied for: {app.job?.title || "Role"}</span>
                                  {app.job?.jobId && <span className="font-mono text-slate-400">Job ID: {app.job.jobId}</span>}
                                  <span className="font-mono text-slate-400">App ID: {String(app._id).slice(-6)}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 self-start sm:self-auto">
                                <Link
                                  to={`/admin/jobs/${app.job?._id || app.job}/applicants`}
                                  className="inline-flex items-center gap-1 rounded-lg bg-violet-700 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-violet-800"
                                >
                                  <Eye size={13} /> View in Pipeline
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">
                          No applicants matched this search term.
                        </p>
                      )}
                    </div>
                  )}

                  {searchResults?.totalJobs === 0 && searchResults?.totalApplicants === 0 && (
                    <div className="py-8 text-center">
                      <Search size={32} className="mx-auto text-slate-300 mb-2" />
                      <h5 className="font-bold text-slate-800">No records found</h5>
                      <p className="mt-1 text-xs text-slate-500">
                        No jobs or applicants matched "{searchTerm}". Check the spelling or status filter.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {error ? (
            <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
          ) : (
            <>
              {/* Analytics Summary */}
              <section aria-label="Recruiter activity summary" className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {metricCards.map(({ key, label, icon: Icon, color }) => (
                  <article key={key} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-600">{label}</p>
                      <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}><Icon size={20} /></span>
                    </div>
                    <p className="mt-3 text-3xl font-bold text-slate-900">
                      {loading ? <span className="animate-pulse text-slate-300">—</span> : dashboard?.metrics?.[key] ?? 0}
                    </p>
                  </article>
                ))}
              </section>

              <section className="mt-6 grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700"><BarChart3 size={20} /></span>
                    <div>
                      <h2 className="font-semibold text-slate-900">Application activity</h2>
                      <p className="text-sm text-slate-500">Applications received over the last six months</p>
                    </div>
                  </div>
                  {loading ? <p className="mt-8 text-sm text-slate-500">Loading analytics...</p> : trend.length ? (
                    <div className="mt-6 grid h-48 grid-cols-6 items-end gap-3" aria-label="Monthly application count chart">
                      {trend.map((item) => (
                        <div key={item.month} className="flex h-full flex-col items-center justify-end gap-2">
                          <span className="text-xs font-medium text-slate-600">{item.applications}</span>
                          <div className="flex w-full flex-1 items-end">
                            <div
                              className="w-full rounded-t-md bg-violet-500 transition-all"
                              style={{ height: `${Math.max((item.applications / maxApplications) * 100, item.applications ? 8 : 2)}%` }}
                              title={`${item.month}: ${item.applications} applications`}
                            />
                          </div>
                          <span className="text-xs text-slate-500">{item.month}</span>
                        </div>
                      ))}
                    </div>
                  ) : <p className="mt-8 text-sm text-slate-500">No application activity yet.</p>}
                </article>

                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-semibold text-slate-900">Upcoming interviews</h2>
                      <p className="mt-1 text-sm text-slate-500">Scheduled for your candidates</p>
                    </div>
                    <Clock3 size={19} className="text-violet-700" />
                  </div>
                  {loading ? <p className="mt-6 text-sm text-slate-500">Loading interviews...</p> : dashboard?.upcomingInterviewList?.length ? (
                    <ul className="mt-4 divide-y divide-slate-100">
                      {dashboard.upcomingInterviewList.slice(0, 5).map((interview) => (
                        <li key={interview._id} className="py-3">
                          <p className="font-medium text-slate-800">{interview.applicant?.fullName || "Candidate"}</p>
                          <p className="mt-1 text-sm text-slate-500">{interview.job?.title || "Role"} · {new Date(interview.stageDetails.interviewDate).toLocaleString()}</p>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No upcoming interviews are recorded.</p>}
                </article>
              </section>

              <section className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
                <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <div>
                      <h2 className="font-semibold text-slate-900">Recent applications</h2>
                      <p className="mt-1 text-sm text-slate-500">Latest candidates across your jobs</p>
                    </div>
                    <Link to="/admin/jobs" className="inline-flex items-center gap-1 text-sm font-semibold text-violet-700 hover:text-violet-900">Manage jobs <ArrowRight size={15} /></Link>
                  </div>
                  {loading ? <p className="p-6 text-sm text-slate-500">Loading applications...</p> : dashboard?.recentApplications?.length ? (
                    <ul className="divide-y divide-slate-100">
                      {dashboard.recentApplications.map((application) => (
                        <li key={application._id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-900">{application.applicant?.fullName || "Candidate"}</p>
                            <p className="mt-1 truncate text-sm text-slate-500">{application.job?.title || "Role"} · {application.applicant?.email || ""}</p>
                          </div>
                          <div className="flex shrink-0 items-center gap-3">
                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusClass[application.status] || statusClass.applied}`}>{application.status}</span>
                            <span className="text-xs text-slate-500">{new Date(application.createdAt).toLocaleDateString()}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : <div className="p-8 text-center text-sm text-slate-500">Applications will appear here when candidates apply.</div>}
                </article>

                <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <div>
                      <h2 className="font-semibold text-slate-900">Your latest jobs</h2>
                      <p className="mt-1 text-sm text-slate-500">Postings and application counts</p>
                    </div>
                    <Link to="/admin/jobs" className="text-sm font-semibold text-violet-700 hover:text-violet-900">View all</Link>
                  </div>
                  {loading ? <p className="p-6 text-sm text-slate-500">Loading jobs...</p> : dashboard?.jobs?.length ? (
                    <ul className="divide-y divide-slate-100">
                      {dashboard.jobs.map((job) => (
                        <li key={job._id} className="flex items-center justify-between gap-3 px-5 py-4">
                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-900">{job.title}</p>
                            <p className="mt-1 text-sm text-slate-500">{job.company?.name || "Company"} · <span className={job.status === "Inactive" ? "text-slate-500" : "text-emerald-700"}>{job.status === "Inactive" ? "Inactive" : "Active"}</span></p>
                          </div>
                          <Link to={`/admin/jobs/${job._id}/applicants`} className="shrink-0 text-sm font-semibold text-violet-700 hover:text-violet-900">{job.applicationCount} applicants</Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-8 text-center">
                      <BriefcaseBusiness className="mx-auto text-slate-300" size={30} />
                      <p className="mt-3 font-medium text-slate-800">No jobs posted yet</p>
                      <p className="mt-1 text-sm text-slate-500">Create a posting to start receiving applications.</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3 border-t border-slate-100 p-4">
                    <Link to="/admin/companies" className="rounded-lg border border-slate-200 px-3 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-50">Companies</Link>
                    <Link to="/admin/candidates" className="rounded-lg border border-slate-200 px-3 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-50">Candidate ranking</Link>
                  </div>
                </article>
              </section>
            </>
          )}
        </div>
      </main>
    </>
  );
};

export default RecruiterDashboard;
