import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import LatestJobCards from "./LatestJobCards";

const LatestJobs = () => {
  const { allJobs = [] } = useSelector((store) => store.job);
  const [searchParams] = useSearchParams();
  const selectedLocation = searchParams.get("location");
  const latestJobs = [...allJobs]
    .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt))
    .slice(0, 6);

  return (
    <section id="latest-jobs" className="scroll-mt-24 bg-[#F8FAFC] py-14 sm:py-18">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-[0.14em] text-violet-700">
              <Sparkles size={15} /> New opportunities
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#172554] sm:text-4xl">Latest jobs for you</h2>
            <p className="mt-2 text-sm text-slate-500">
              {selectedLocation
                ? `Fresh roles and internships in ${selectedLocation}.`
                : "Fresh roles and internships shared by hiring teams."}
            </p>
          </div>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 self-start text-sm font-semibold text-violet-800 transition hover:text-violet-950 sm:self-auto"
          >
            View all jobs <ArrowRight size={17} />
          </Link>
        </div>

        {latestJobs.length > 0 ? (
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {latestJobs.map((job) => <LatestJobCards key={job._id} job={job} />)}
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
      </div>
    </section>
  );
};

export default LatestJobs;
