import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  Plus,
  UserRoundCheck,
  Users,
  XCircle,
} from "lucide-react";
import Navbar from "../shared/Navbar";
import { RECRUITER_API_ENDPOINT } from "@/utils/constant";

const metricCards = [
  { key: "totalJobs", label: "Total jobs posted", icon: BriefcaseBusiness, color: "bg-violet-50 text-violet-700" },
  { key: "activeJobs", label: "Active jobs", icon: CheckCircle2, color: "bg-emerald-50 text-emerald-700" },
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

  const trend = dashboard?.applicationTrend || [];
  const maxApplications = Math.max(...trend.map((item) => item.applications), 1);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <header className="flex flex-col justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold text-violet-700">Recruiter workspace</p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
              <p className="mt-2 text-sm text-slate-600">Your recruiting activity, candidates, and open roles.</p>
            </div>
            <Link to="/admin/jobs/create" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 text-sm font-semibold text-white hover:bg-violet-800">
              <Plus size={17} /> Post a job
            </Link>
          </header>

          {error ? (
            <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
          ) : (
            <>
              <section aria-label="Recruiter activity summary" className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
