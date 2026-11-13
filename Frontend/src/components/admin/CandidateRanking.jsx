import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FileText, LoaderCircle, Search, Sparkles, Users } from "lucide-react";
import Navbar from "../shared/Navbar";
import { JOB_API_ENDPOINT, RECRUITER_API_ENDPOINT } from "@/utils/constant";

const CandidateRanking = () => {
  const [jobs, setJobs] = useState([]);
  const [jobId, setJobId] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [loadedJobId, setLoadedJobId] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [error, setError] = useState("");
  const [method, setMethod] = useState("");
  const loadingCandidates = Boolean(jobId && loadedJobId !== jobId);

  useEffect(() => {
    let active = true;
    axios.get(`${JOB_API_ENDPOINT}/getadminjobs`, { withCredentials: true })
      .then(({ data }) => {
        if (!data.success) throw new Error("Unable to load your jobs.");
        if (!active) return;
        const recruiterJobs = data.jobs || [];
        setJobs(recruiterJobs);
        setJobId(recruiterJobs[0]?._id || "");
      })
      .catch((requestError) => {
        if (active) setError(requestError?.response?.data?.message || requestError.message || "Unable to load your jobs.");
      })
      .finally(() => {
        if (active) setLoadingJobs(false);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!jobId) return undefined;
    let active = true;
    axios.get(`${RECRUITER_API_ENDPOINT}/jobs/${jobId}/candidates`, { withCredentials: true })
      .then(({ data }) => {
        if (!data.success) throw new Error("Unable to rank candidates.");
        if (active) {
          setCandidates(data.candidates || []);
          setMethod(data.rankingMethod || "");
        }
      })
      .catch((requestError) => {
        if (active) {
          setCandidates([]);
          setError(requestError?.response?.data?.message || requestError.message || "Unable to rank candidates.");
        }
      })
      .finally(() => {
        if (active) setLoadedJobId(jobId);
      });
    return () => { active = false; };
  }, [jobId]);

  const visibleCandidates = useMemo(() => candidates.filter((candidate) => {
    const matchesStatus = statusFilter === "all" || candidate.status === statusFilter;
    const query = search.trim().toLowerCase();
    const matchesQuery = !query ||
      candidate.candidate?.fullName?.toLowerCase().includes(query) ||
      candidate.candidate?.email?.toLowerCase().includes(query);
    return matchesStatus && matchesQuery;
  }), [candidates, search, statusFilter]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold text-violet-700"><Sparkles size={16} /> ATS candidate ranking</p>
                <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Find your strongest matches</h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-600">Rank applicants against a job’s actual requirements and description. Scores use candidate resume content and are explainable keyword-based signals, not generated estimates.</p>
              </div>
              <label className="w-full md:max-w-sm">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Select job description</span>
                <select
                  value={jobId}
                  onChange={(event) => {
                    setError("");
                    setJobId(event.target.value);
                  }}
                  disabled={loadingJobs || !jobs.length}
                  className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                >
                  {jobs.length ? jobs.map((job) => <option key={job._id} value={job._id}>{job.title}</option>) : <option value="">No jobs available</option>}
                </select>
              </label>
            </div>
          </header>

          {error && <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

          <section className="mt-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-100 p-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Users size={17} className="text-violet-700" />
                <span><strong className="text-slate-900">{loadingCandidates ? "…" : candidates.length}</strong> applicants ranked</span>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <label className="relative">
                  <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search candidates" className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-violet-500 sm:w-56" />
                </label>
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700">
                  <option value="all">All statuses</option>
                  {["applied", "under review", "shortlisted", "interview scheduled", "selected", "rejected"].map((status) => <option key={status} value={status}>{status.replace(/\b\w/g, (letter) => letter.toUpperCase())}</option>)}
                </select>
              </div>
            </div>

            {loadingCandidates ? (
              <div className="flex items-center justify-center gap-2 p-12 text-sm text-slate-500"><LoaderCircle size={18} className="animate-spin" /> Analyzing applicant resumes...</div>
            ) : visibleCandidates.length ? (
              <ol className="divide-y divide-slate-100">
                {visibleCandidates.map((candidate) => (
                  <li key={candidate.applicationId} className="p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex min-w-0 items-start gap-4">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-50 text-sm font-bold text-violet-800">#{candidates.indexOf(candidate) + 1}</span>
                        <div className="min-w-0">
                          <h2 className="font-semibold text-slate-900">{candidate.candidate?.fullName || "Candidate"}</h2>
                          <p className="mt-1 break-all text-sm text-slate-500">{candidate.candidate?.email}</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {candidate.matchedSkills.slice(0, 8).map((skill) => <span key={skill} className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">{skill}</span>)}
                            {candidate.matchedSkills.length === 0 && <span className="text-xs text-slate-500">No listed requirements matched</span>}
                          </div>
                          {candidate.missingSkills.length > 0 && <p className="mt-2 text-xs text-amber-800">Missing / unconfirmed: {candidate.missingSkills.slice(0, 5).join(", ")}</p>}
                          {candidate.education?.length > 0 && <p className="mt-2 text-xs text-slate-600">Education: {candidate.education.map((item) => [item.degree, item.fieldOfStudy, item.institution].filter(Boolean).join(" · ")).filter(Boolean).join("; ")}</p>}
                          {candidate.experience?.length > 0 && <p className="mt-1 text-xs text-slate-600">Experience: {candidate.experience.map((item) => [item.role, item.company].filter(Boolean).join(" at ")).filter(Boolean).join("; ")}</p>}
                          <ul className="mt-3 space-y-1 text-xs text-slate-600">
                            {candidate.explanation.map((reason) => <li key={reason}>• {reason}</li>)}
                          </ul>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-4 lg:flex-col lg:items-end">
                        <div className="text-left lg:text-right">
                          <p className="text-2xl font-bold text-violet-800">{candidate.matchingScore}%</p>
                          <p className="text-xs text-slate-500">match score</p>
                        </div>
                        {candidate.resumeUrl ? (
                          <a href={candidate.resumeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                            <FileText size={15} /> {candidate.resumeFileName || "View resume"}
                          </a>
                        ) : <span className="text-xs text-slate-500">No resume file</span>}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="p-12 text-center">
                <Users size={32} className="mx-auto text-slate-300" />
                <p className="mt-3 font-semibold text-slate-800">{jobId ? "No applicants match these filters" : "Post a job to get started"}</p>
                <p className="mt-1 text-sm text-slate-500">Candidate results only include applications for jobs you own.</p>
              </div>
            )}
          </section>
          {method && <p className="mt-3 text-xs text-slate-500">{method}</p>}
        </div>
      </main>
    </>
  );
};

export default CandidateRanking;
