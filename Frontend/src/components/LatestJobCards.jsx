import { useState } from "react";
import { ArrowUpRight, Bookmark, BriefcaseBusiness, Clock3, MapPin } from "lucide-react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { USER_API_ENDPOINT } from "@/utils/constant";

const LatestJobCards = ({ job }) => {
  const [saving, setSaving] = useState(false);
  const date = job?.createdAt ? new Date(job.createdAt) : null;
  const postedDate = date && !Number.isNaN(date.getTime())
    ? date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
    : "Recently";

  const saveJobHandler = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const res = await axios.post(
        `${USER_API_ENDPOINT}/savejob/${job?._id}`,
        {},
        { withCredentials: true }
      );
      if (res.data.success) toast.success(res.data.message);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to save this job.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 transition duration-200 hover:-translate-y-1 hover:border-violet-200 hover:shadow-[0_16px_40px_rgba(15,23,42,0.09)]">
      <div className="flex items-start gap-3">
        {job?.company?.logo ? (
          <img
            src={job.company.logo}
            alt={`${job.company?.name || "Company"} logo`}
            className="h-12 w-12 shrink-0 rounded-xl border border-slate-100 bg-white object-contain p-1.5"
          />
        ) : (
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-lg font-semibold text-violet-800">
            {job?.company?.name?.charAt(0) || "H"}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-800">{job?.company?.name || "Company"}</p>
          <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-slate-500">
            <MapPin size={13} className="shrink-0" />
            {job?.location || "Location not specified"}
          </p>
        </div>
        <button
          type="button"
          onClick={saveJobHandler}
          disabled={saving}
          aria-label={`Save ${job?.title || "job"}`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 disabled:opacity-50"
        >
          <Bookmark size={16} />
        </button>
      </div>

      <h3 className="mt-5 line-clamp-2 text-lg font-semibold tracking-tight text-slate-950">{job?.title}</h3>
      <p className="mt-1 text-sm text-slate-500">{job?.company?.name || "Hiring company"}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {job?.experienceLevel ?? 0} years experience
        </span>
        {job?.jobType && <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-800">{job.jobType}</span>}
      </div>

      {job?.requirements?.length > 0 && (
        <div className="mt-4 flex min-h-7 flex-wrap gap-1.5">
          {job.requirements.slice(0, 3).map((skill, index) => (
            <span key={`${skill}-${index}`} className="rounded-md border border-slate-200 px-2 py-1 text-[11px] text-slate-600">{skill}</span>
          ))}
          {job.requirements.length > 3 && <span className="px-1 py-1 text-[11px] text-slate-500">+{job.requirements.length - 3}</span>}
        </div>
      )}

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-800">
          <BriefcaseBusiness size={15} className="text-violet-700" />
          {job?.salary !== undefined && job?.salary !== null ? `₹${job.salary} LPA` : "Salary not listed"}
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
          <Clock3 size={13} /> {postedDate}
        </span>
      </div>

      <Link
        to={`/description/${job._id}`}
        className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-violet-700 px-4 text-sm font-semibold text-white transition hover:bg-violet-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
      >
        View details <ArrowUpRight size={16} />
      </Link>
    </article>
  );
};

export default LatestJobCards;
