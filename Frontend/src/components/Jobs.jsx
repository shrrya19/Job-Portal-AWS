import { useMemo, useState } from "react";
import Navbar from "./shared/Navbar";
import FilterCard from "./FilterCard";
import Job from "./Job";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import useGetAllJobs from "@/hooks/useGetAllJobs";
import { useSearchParams } from "react-router-dom";

const Jobs = ({ internshipsOnly = false }) => {
  useGetAllJobs({ includeSearchedQuery: false });
  const { allJobs, jobsLoading } = useSelector((store) => store.job);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    role: "",
    salary: "",
    industry: "",
    jobType: "",
    workMode: "",
    experience: searchParams.get("experience") || "",
  });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const locationFilter = searchParams.get("location") || "All India";
  const availableJobs = useMemo(() => allJobs || [], [allJobs]);
  const jobsByType = availableJobs.filter((job) => {
    const isInternship = job.jobType?.toLowerCase() === "internship";
    return internshipsOnly ? isInternship : !isInternship;
  });
  const industries = useMemo(() => [...new Set(
    availableJobs.map((job) => job.company?.industry).filter(Boolean)
  )].sort((first, second) => first.localeCompare(second)), [availableJobs]);
  const filterJobs = jobsByType.filter((job) => {
    const searchTerm = search.trim().toLowerCase();
    if (searchTerm && ![job.title, job.company?.name].some((value) => value?.toLowerCase().includes(searchTerm))) {
      return false;
    }

    if (filters.industry && job.company?.industry !== filters.industry) return false;
    if (filters.jobType && job.jobType !== filters.jobType) return false;
    if (filters.workMode && job.workMode !== filters.workMode) return false;
    if (filters.experience) {
      const [minimumText, maximumText] = filters.experience.split("-");
      const minimum = Number(minimumText.replace("+", ""));
      const maximum = maximumText ? Number(maximumText) : Number.POSITIVE_INFINITY;
      const experience = Number(job.experienceLevel ?? 0);
      if (experience < minimum || experience > maximum) return false;
    }

    if (filters.role) {
      const searchableText = [
        job.title,
        job.description,
        ...(Array.isArray(job.requirements) ? job.requirements : []),
      ].join(" ").toLowerCase();
      const roleTerms = {
        "Frontend Developer": ["frontend", "front-end", "front end", "fronted"],
        "Backend Developer": ["backend", "back-end", "back end"],
        "Full Stack Developer": ["full stack", "fullstack", "full-stack"],
        "UI/UX Designer": ["ui/ux", "ui", "ux", "designer", "design"],
        "Product Manager": ["product manager", "product management"],
        "Data Scientist": ["data scientist", "data science", "data analyst"],
        "DevOps Engineer": ["devops", "dev ops", "site reliability"],
      }[filters.role] || [filters.role.toLowerCase()];
      if (!roleTerms.some((term) => searchableText.includes(term))) return false;
    }

    if (filters.salary) {
      const salaryMin = Number(job.salaryMin ?? job.salary);
      const salaryMax = Number(job.salaryMax ?? job.salary);
      const [minimumText, maximumText] = filters.salary.split("-");
      const minimum = Number(minimumText.replace("+", ""));
      const maximum = maximumText ? Number(maximumText) : Number.POSITIVE_INFINITY;
      if (!Number.isFinite(salaryMin) || !Number.isFinite(salaryMax) ||
        salaryMin > maximum || salaryMax < minimum) return false;
    }

    return true;
  });
  const pageSize = 12;
  const pageCount = Math.max(1, Math.ceil(filterJobs.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageJobs = filterJobs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const changeFilter = (filterKey, value) => {
    if (filterKey === "all") {
      setPage(1);
      setFilters({ role: "", salary: "", industry: "", jobType: "", workMode: "", experience: "" });
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        next.delete("location");
        next.delete("experience");
        return next;
      });
      return;
    }

    if (filterKey === "location") {
      setPage(1);
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        if (!value || value.toLowerCase() === "all india") next.delete("location");
        else next.set("location", value);
        return next;
      });
      return;
    }

    setPage(1);
    setFilters((currentFilters) => ({ ...currentFilters, [filterKey]: value }));
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <div className="bg-white rounded-3xl border border-purple-100 shadow-lg p-8">
              <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium">
                {internshipsOnly ? "Early Career Opportunities" : "Discover Opportunities"}
              </span>
              <h1 className="text-3xl font-bold mt-5">
                {internshipsOnly ? "Find your next internship" : "Find your next role"}
              </h1>
              <p className="text-gray-500 mt-4 text-lg">
                {internshipsOnly
                  ? "Explore internship opportunities from companies hiring emerging talent."
                  : "Explore full-time and contract opportunities from top companies."}
              </p>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5 mb-8">
            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5">
              <h3 className="text-purple-700 font-semibold">Total Jobs</h3>
              <p className="text-3xl font-bold mt-2">{jobsByType.length}</p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
              <h3 className="text-orange-600 font-semibold">Search Results</h3>
              <p className="text-3xl font-bold mt-2">{filterJobs.length}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
              <h3 className="text-green-600 font-semibold">Active Hiring</h3>
              <p className="text-3xl font-bold mt-2">{filterJobs.length}</p>
            </div>
          </div>

          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="w-full shrink-0 lg:w-[280px]">
              <div className="bg-white rounded-3xl border border-purple-100 shadow-lg p-4 lg:sticky lg:top-24">
                <h2 className="font-bold text-xl mb-4 text-[#6D28D9]">Filters</h2>
                <FilterCard
                  key={locationFilter}
                  filters={{ ...filters, location: locationFilter }}
                  onFilterChange={changeFilter}
                  industries={industries}
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="relative mb-5 block">
                <span className="sr-only">Search jobs or companies</span>
                <input
                  type="search"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search by job title or company"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                />
              </label>
              {jobsLoading && filterJobs.length === 0 ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-violet-700" />
                  <p className="mt-3 text-sm text-slate-500">Loading active opportunities...</p>
                </div>
              ) : filterJobs.length <= 0 ? (
                <div className="bg-white rounded-3xl shadow-lg border p-16 text-center">
                  <h2 className="text-3xl font-bold text-gray-700">
                    {locationFilter !== "All India"
                      ? `No jobs available in ${locationFilter}`
                      : "😔 No Jobs Found"}
                  </h2>
                  <p className="text-gray-500 mt-3">
                    {locationFilter !== "All India"
                      ? "Try another Indian city or choose All India."
                      : "Try searching with another keyword."}
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">
                        {internshipsOnly ? "Latest Internships" : "Latest Jobs"}
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">{filterJobs.length} matching opportunities</p>
                    </div>
                    {pageCount > 1 && <p className="text-sm text-slate-500">Page {currentPage} of {pageCount}</p>}
                  </div>
                  <div className="grid xl:grid-cols-3 md:grid-cols-2 gap-6">
                    {pageJobs.map((job, index) => (
                      <motion.div
                        key={job?._id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        whileHover={{ y: -8 }}
                        className="h-full"
                      >
                        <Job job={job} />
                      </motion.div>
                    ))}
                  </div>
                  {pageCount > 1 && (
                    <nav aria-label="Job listing pages" className="mt-8 flex items-center justify-center gap-3">
                      <button
                        type="button"
                        disabled={currentPage === 1}
                        onClick={() => setPage((current) => Math.max(1, current - 1))}
                        className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <span className="text-sm text-slate-600">{currentPage} / {pageCount}</span>
                      <button
                        type="button"
                        disabled={currentPage === pageCount}
                        onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
                        className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Next
                      </button>
                    </nav>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Jobs;
