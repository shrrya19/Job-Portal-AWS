import { useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  MapPin,
  Search,
  Sparkles,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setSearchedQuery } from "@/redux/jobSlice";
import { toast } from "sonner";
import IndiaLocationDatalist from "./shared/IndiaLocationDatalist";
import indiaLocations from "@/data/indiaLocations.json";

const popularSearches = [
  "Software Developer",
  "Java Developer",
  "Python Developer",
  "Data Analyst",
  "Web Developer",
  "Internship",
];

const HeroSection = () => {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const searchJobs = (searchTerm = keyword) => {
    const selectedLocation = location.trim();
    const locationAliases = ["Bangalore", "Banglore", "Gurgaon", "Bombay", "Calcutta", "Madras", "Trivandrum", "Goa (Panaji)"];
    if (
      selectedLocation &&
      selectedLocation.toLowerCase() !== "all india" &&
      !indiaLocations.includes(selectedLocation) &&
      !locationAliases.includes(selectedLocation)
    ) {
      toast.error("Choose an Indian location from the dropdown.");
      return;
    }

    const internshipSearch = searchTerm.trim().toLowerCase() === "internship";
    dispatch(setSearchedQuery(internshipSearch ? "" : searchTerm.trim()));
    const params = new URLSearchParams();
    if (selectedLocation && selectedLocation.toLowerCase() !== "all india") {
      params.set("location", selectedLocation);
    }
    if (experience) params.set("experience", experience);
    const route = internshipSearch ? "/internships" : "/browse";
    navigate(`${route}${params.size ? `?${params.toString()}` : ""}`);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    searchJobs();
  };

  return (
    <section className="relative overflow-hidden bg-[#F8FAFC]">
      <div className="pointer-events-none absolute -right-36 -top-32 h-[28rem] w-[28rem] rounded-full bg-violet-100/70 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-48 left-[-6rem] h-[28rem] w-[28rem] rounded-full bg-blue-100/60 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.1fr_.9fr] lg:gap-14 lg:py-24">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-3.5 py-2 text-sm font-medium text-violet-800 shadow-sm">
            <Sparkles size={16} />
            A better start to your career
          </div>
          <h1 className="mt-6 max-w-2xl text-4xl font-semibold leading-[1.12] tracking-tight text-[#172554] sm:text-5xl lg:text-6xl">
            Find Your Dream Job.
            <span className="mt-1 block text-violet-700">Build Your Future.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
            Explore thousands of job opportunities and internships. Discover
            the right career path and connect with leading companies.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_16px_50px_rgba(15,23,42,0.10)]"
          >
            <div className="grid gap-1 lg:grid-cols-[1.2fr_.85fr_.8fr_auto]">
              <label className="flex min-w-0 items-center gap-3 rounded-xl px-3 py-2.5 focus-within:bg-slate-50">
                <Search size={19} className="shrink-0 text-violet-700" />
                <span className="sr-only">Job title, skills, or company</span>
                <input
                  type="search"
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="Job title, skills or company"
                  className="w-full min-w-0 border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-0"
                />
              </label>
              <label className="flex min-w-0 items-center gap-3 rounded-xl border-t border-slate-100 px-3 py-2.5 focus-within:bg-slate-50 lg:border-l lg:border-t-0">
                <MapPin size={19} className="shrink-0 text-violet-700" />
                <span className="sr-only">Location</span>
                <input
                  type="search"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  list="homepage-india-locations"
                  placeholder="Location"
                  className="w-full min-w-0 border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-0"
                />
                <IndiaLocationDatalist id="homepage-india-locations" includeAllIndia />
              </label>
              <label className="flex min-w-0 items-center gap-3 rounded-xl border-t border-slate-100 px-3 py-2.5 focus-within:bg-slate-50 lg:border-l lg:border-t-0">
                <BriefcaseBusiness size={18} className="shrink-0 text-violet-700" />
                <span className="sr-only">Experience level</span>
                <select
                  value={experience}
                  onChange={(event) => setExperience(event.target.value)}
                  className="w-full min-w-0 border-0 bg-transparent text-sm text-slate-600 outline-none focus:ring-0"
                >
                  <option value="">Experience</option>
                  <option value="0-1">Fresher · 0–1 years</option>
                  <option value="1-3">1–3 years</option>
                  <option value="3-5">3–5 years</option>
                  <option value="5+">5+ years</option>
                </select>
              </label>
              <button
                type="submit"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 text-sm font-semibold text-white transition-colors hover:bg-violet-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
              >
                Search Jobs <ArrowRight size={17} />
              </button>
            </div>
          </form>

          <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
            <span className="mr-1 font-medium text-slate-600">Popular searches:</span>
            {popularSearches.map((search) => (
              <button
                key={search}
                type="button"
                onClick={() => searchJobs(search)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-800"
              >
                {search}
              </button>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[31rem]">
          <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-violet-200/60 to-blue-100/50 blur-2xl" />
          <div className="relative rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.12)] sm:p-7">
            <div className="flex items-center justify-between border-b border-slate-100 pb-5">
              <div>
                <p className="text-sm font-semibold text-slate-900">Your next opportunity</p>
                <p className="mt-1 text-xs text-slate-500">A brighter path from campus to career</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
                <Building2 size={21} />
              </div>
            </div>
            <div className="relative mt-5 min-h-52 overflow-hidden rounded-2xl bg-gradient-to-br from-[#172554] via-[#30216d] to-violet-800 p-5 text-white sm:p-6">
              <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full border border-white/15" />
              <div className="absolute -right-1 top-6 h-24 w-24 rounded-full border border-white/15" />
              <div className="relative flex h-full min-h-40 flex-col justify-between">
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-violet-100">
                  <Sparkles size={13} /> Built for emerging talent
                </span>
                <div className="mt-8">
                  <p className="text-2xl font-semibold tracking-tight">Your skills have a place here.</p>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-violet-100">Find internships and early-career opportunities that help you grow.</p>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate("/internships")}
              className="mt-4 flex w-full items-center justify-between rounded-xl border border-slate-200 p-4 text-left transition hover:border-violet-200 hover:bg-violet-50/50"
            >
              <span>
                <span className="block text-sm font-semibold text-slate-900">Looking for an internship?</span>
                <span className="mt-1 block text-xs text-slate-500">Explore opportunities for students</span>
              </span>
              <ArrowRight size={17} className="text-violet-700" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
