import { useMemo } from "react";
import { Link, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Search,
  XCircle,
} from "lucide-react";
import Navbar from "./shared/Navbar";
import useGetAppliedJobs from "@/hooks/useGetAppliedJobs";
import AppliedJobTable from "./AppliedJobTable";

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
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <header className="flex flex-col justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold text-violet-700">Student workspace</p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                Welcome{user.fullName ? `, ${user.fullName.split(" ")[0]}` : ""}
              </h1>
              <p className="mt-2 text-sm text-slate-600">Track applications, interview updates, and job offers in one place.</p>
            </div>
            <Link to="/jobs" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 text-sm font-semibold text-white hover:bg-violet-800">
              <Search size={17} /> Find jobs
            </Link>
          </header>

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

          <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold text-slate-900">My applications</h2>
                <p className="mt-1 text-sm text-slate-500">See every stage, interview result, and offer response. Updates refresh automatically.</p>
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
