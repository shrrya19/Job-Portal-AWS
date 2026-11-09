import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Plus,
  Users,
} from "lucide-react";
import Navbar from "../shared/Navbar";
import { JOB_API_ENDPOINT, COMPANY_API_ENDPOINT } from "@/utils/constant";

const RecruiterDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const loadDashboard = async () => {
      try {
        setError("");
        const [jobsResponse, companiesResponse] = await Promise.all([
          axios.get(`${JOB_API_ENDPOINT}/getadminjobs`, {
            withCredentials: true,
            signal: controller.signal,
          }),
          axios.get(`${COMPANY_API_ENDPOINT}/get`, {
            withCredentials: true,
            signal: controller.signal,
          }),
        ]);
        if (!jobsResponse.data.success || !companiesResponse.data.success) {
          throw new Error("Unable to load recruiter dashboard data.");
        }
        setJobs(jobsResponse.data.jobs || []);
        setCompanies(companiesResponse.data.companies || []);
      } catch (requestError) {
        if (!controller.signal.aborted) {
          console.error("Recruiter dashboard loading failed:", requestError);
          setError(requestError?.response?.data?.message || "Unable to load dashboard data. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadDashboard();
    return () => controller.abort();
  }, []);

  const applicationCount = useMemo(
    () => jobs.reduce((total, job) => total + (job.applications?.length || 0), 0),
    [jobs]
  );
  const metrics = [
    { label: "Total jobs", value: jobs.length, icon: BriefcaseBusiness, color: "bg-violet-50 text-violet-700" },
    { label: "Companies", value: companies.length, icon: Building2, color: "bg-blue-50 text-blue-700" },
    { label: "Applications", value: applicationCount, icon: Users, color: "bg-emerald-50 text-emerald-700" },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <section className="rounded-3xl border border-purple-100 bg-white p-6 shadow-lg sm:p-8">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div>
                <span className="rounded-full bg-purple-100 px-3 py-1.5 text-sm font-medium text-violet-800">
                  Recruiter workspace
                </span>
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Dashboard
                </h1>
                <p className="mt-2 text-slate-600">
                  Track your job postings, companies, and candidate applications.
                </p>
              </div>
              <Link
                to="/admin/jobs/create"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 text-sm font-semibold text-white transition hover:bg-violet-800"
              >
                <Plus size={17} /> Post a job
              </Link>
            </div>
          </section>

          {error ? (
            <div role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              {error}
            </div>
          ) : (
            <>
              <section aria-label="Recruiter activity summary" className="mt-6 grid gap-4 sm:grid-cols-3">
                {metrics.map(({ label, value, icon: Icon, color }) => (
                  <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-600">{label}</p>
                      <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
                        <Icon size={20} />
                      </span>
                    </div>
                    <p className="mt-3 text-3xl font-bold text-slate-900">
                      {loading ? <span className="text-slate-300">—</span> : value}
                    </p>
                  </article>
                ))}
              </section>

              <section className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_.8fr]">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <div>
                      <h2 className="font-semibold text-slate-900">Recent job postings</h2>
                      <p className="mt-1 text-sm text-slate-500">Your latest opportunities</p>
                    </div>
                    <Link to="/admin/jobs" className="inline-flex items-center gap-1 text-sm font-semibold text-violet-700 hover:text-violet-900">
                      View all <ArrowRight size={15} />
                    </Link>
                  </div>
                  {loading ? (
                    <p className="p-6 text-sm text-slate-500">Loading job postings...</p>
                  ) : jobs.length ? (
                    <ul className="divide-y divide-slate-100">
                      {jobs.slice(0, 5).map((job) => (
                        <li key={job._id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-900">{job.title}</p>
                            <p className="mt-1 text-sm text-slate-500">
                              {job.company?.name || "Company"} · {job.locations?.join(", ") || job.location}
                            </p>
                          </div>
                          <Link
                            to={`/admin/jobs/${job._id}/applicants`}
                            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-violet-700 hover:text-violet-900"
                          >
                            <Users size={15} /> {job.applications?.length || 0} applicants
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-8 text-center">
                      <BriefcaseBusiness className="mx-auto text-slate-300" size={30} />
                      <p className="mt-3 font-medium text-slate-800">No jobs posted yet</p>
                      <p className="mt-1 text-sm text-slate-500">Create a job posting to start receiving applications.</p>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="font-semibold text-slate-900">Quick links</h2>
                  <div className="mt-4 space-y-3">
                    <Link to="/admin/jobs" className="flex items-center justify-between rounded-xl border border-slate-200 p-4 text-sm font-medium text-slate-700 transition hover:border-violet-200 hover:bg-violet-50">
                      Manage jobs <ArrowRight size={16} className="text-violet-700" />
                    </Link>
                    <Link to="/admin/companies" className="flex items-center justify-between rounded-xl border border-slate-200 p-4 text-sm font-medium text-slate-700 transition hover:border-violet-200 hover:bg-violet-50">
                      Manage companies <ArrowRight size={16} className="text-violet-700" />
                    </Link>
                    <Link to="/admin/companies/create" className="flex items-center justify-between rounded-xl border border-slate-200 p-4 text-sm font-medium text-slate-700 transition hover:border-violet-200 hover:bg-violet-50">
                      Add a company <ArrowRight size={16} className="text-violet-700" />
                    </Link>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </>
  );
};

export default RecruiterDashboard;
