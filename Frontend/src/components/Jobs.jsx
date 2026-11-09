import { useState } from "react";
import Navbar from "./shared/Navbar";
import FilterCard from "./FilterCard";
import Job from "./Job";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import useGetAllJobs from "@/hooks/useGetAllJobs";
import { useSearchParams } from "react-router-dom";

const Jobs = ({ internshipsOnly = false }) => {
  useGetAllJobs({ includeSearchedQuery: false });
  const { allJobs } = useSelector((store) => store.job);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({ role: "", salary: "" });
  const locationFilter = searchParams.get("location") || "All India";
  const availableJobs = allJobs || [];
  const jobsByType = availableJobs.filter((job) => {
    return !internshipsOnly || job.jobType?.toLowerCase() === "internship";
  });
  const filterJobs = jobsByType.filter((job) => {
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
      const salary = Number(job.salary);
      const [minimumText, maximumText] = filters.salary.split("-");
      const minimum = Number(minimumText.replace("+", ""));
      const maximum = maximumText ? Number(maximumText) : Number.POSITIVE_INFINITY;
      if (!Number.isFinite(salary) || salary < minimum) return false;
      if (Number.isFinite(maximum) && (minimum === 0 ? salary > maximum : salary <= minimum || salary > maximum)) {
        return false;
      }
    }

    return true;
  });

  const changeFilter = (filterKey, value) => {
    if (filterKey === "all") {
      setFilters({ role: "", salary: "" });
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        next.delete("location");
        return next;
      });
      return;
    }

    if (filterKey === "location") {
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        if (!value || value.toLowerCase() === "all india") next.delete("location");
        else next.set("location", value);
        return next;
      });
      return;
    }

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
                />
              </div>
            </div>
            <div className="flex-1">
              {filterJobs.length <= 0 ? (
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
                  <h2 className="text-3xl font-bold mb-6">
                    {internshipsOnly ? "Latest Internships" : "Latest Jobs"}
                  </h2>
                  <div className="grid xl:grid-cols-3 md:grid-cols-2 gap-6">
                    {filterJobs.map((job, index) => (
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
