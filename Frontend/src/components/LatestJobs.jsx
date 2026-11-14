import { useMemo, useState } from "react";
import { ArrowRight, Flame, Sparkles, Star } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import LatestJobCards from "./LatestJobCards";

const LatestJobs = () => {
  const [activeTab, setActiveTab] = useState("recommended");
  const { allJobs = [] } = useSelector((store) => store.job);
  const { user } = useSelector((store) => store.auth);
  const [searchParams] = useSearchParams();
  const selectedLocation = searchParams.get("location");

  const studentSkills = useMemo(() => {
    return (user?.profile?.skills || []).map((s) => String(s).toLowerCase().trim());
  }, [user]);

  const recommendedJobs = useMemo(() => {
    if (!allJobs.length) return [];
    if (!studentSkills.length) {
      // Default recommended: high salary or active jobs
      return [...allJobs]
        .sort((a, b) => (b.salary || 0) - (a.salary || 0))
        .slice(0, 6);
    }
    // Match based on student skills
    return [...allJobs]
      .map((job) => {
        const jobSkills = (job.requirements || []).map((r) => String(r).toLowerCase());
        const matchCount = jobSkills.filter((js) => studentSkills.some((ss) => js.includes(ss) || ss.includes(js))).length;
        return { job, matchCount };
      })
      .sort((a, b) => b.matchCount - a.matchCount || new Date(b.job.createdAt) - new Date(a.job.createdAt))
      .map((item) => item.job)
      .slice(0, 6);
  }, [allJobs, studentSkills]);

  const latestJobs = useMemo(() => {
    return [...allJobs]
      .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt))
      .slice(0, 6);
  }, [allJobs]);

  const featuredJobs = useMemo(() => {
    return [...allJobs]
      .filter((job) => (job.salary && job.salary >= 8) || job.position > 2)
      .slice(0, 6);
  }, [allJobs]);

  const displayJobs = activeTab === "recommended"
    ? (recommendedJobs.length ? recommendedJobs : latestJobs)
    : activeTab === "featured"
      ? (featuredJobs.length ? featuredJobs : latestJobs)
      : latestJobs;

  return (
    <section id="latest-jobs" className="scroll-mt-24 bg-[#F8FAFC] py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-violet-700">
              <Sparkles size={14} /> Curated for Your Success
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#172554] sm:text-4xl">
              Explore Top Jobs &amp; Internships
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {selectedLocation
                ? `Showing curated opportunities available in ${selectedLocation}.`
                : "Hand-picked opportunities from leading employers hiring across India."}
            </p>
          </div>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 self-start rounded-xl bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-800 transition hover:bg-violet-100 hover:text-violet-950 sm:self-auto"
          >
            View all jobs <ArrowRight size={16} />
          </Link>
        </div>

        {/* Tab Filters inspired by Foundit.in */}
        <div className="mt-6 flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab("recommended")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              activeTab === "recommended"
                ? "bg-violet-700 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:border-violet-300 hover:text-violet-800"
            }`}
          >
            <Star size={15} /> Recommended Jobs
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("latest")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              activeTab === "latest"
                ? "bg-violet-700 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:border-violet-300 hover:text-violet-800"
            }`}
          >
            <Sparkles size={15} /> Latest Jobs
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("featured")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              activeTab === "featured"
                ? "bg-violet-700 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:border-violet-300 hover:text-violet-800"
            }`}
          >
            <Flame size={15} /> Featured Jobs
          </button>
        </div>

        {displayJobs.length > 0 ? (
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {displayJobs.map((job) => (
              <LatestJobCards key={job._id} job={job} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <h3 className="text-lg font-semibold text-slate-900">
              {selectedLocation ? `No jobs available in ${selectedLocation}` : "No jobs posted yet"}
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              {selectedLocation ? "Try another Indian city or choose All India." : "Check back soon for new opportunities."}
            </p>
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            to="/jobs"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-violet-700 px-7 text-sm font-semibold text-white shadow-md transition hover:bg-violet-800 hover:shadow-lg"
          >
            Explore All Opportunities <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LatestJobs;
