import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  FileCheck2,
  GraduationCap,
  Video,
  CalendarCheck2,
  House,
  UserRoundCheck,
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setSearchedQuery } from "@/redux/jobSlice";
import axios from "axios";
import { toast } from "sonner";
import { COMPANY_API_ENDPOINT } from "@/utils/constant";
import { Input } from "./ui/input";
import Navbar from "./shared/Navbar";
import HeroSection from "./HeroSection";
import CategoryCarausel from "./CategoryCarausel";
import LatestJobs from "./LatestJobs";
import Footer from "./shared/Footer";
import useGetAllJobs from "@/hooks/useGetAllJobs";

const careerLinks = [
  { title: "Fresher jobs", description: "Start building experience", icon: GraduationCap, query: "", path: "/browse?experience=0-1" },
  { title: "Internship opportunities", description: "Learn while you work", icon: BriefcaseBusiness, query: "", path: "/internships" },
  { title: "Entry-level roles", description: "Take your first career step", icon: UserRoundCheck, query: "", path: "/browse?experience=0-1" },
  { title: "Work from home", description: "Find flexible opportunities", icon: House, query: "", path: "/browse?location=remote" },
  { title: "Graduate trainee jobs", description: "Grow into your profession", icon: BarChart3, query: "graduate trainee", path: "/browse" },
];

const features = [
  { icon: BriefcaseBusiness, title: "Smart job discovery", description: "Explore current openings and internships from employers hiring now.", path: "/jobs" },
  { icon: FileCheck2, title: "ATS resume builder", description: "Create a polished resume and check how it matches a job description.", path: "/ats-resume" },
  { icon: Video, title: "AI mock interviews", description: "Build confidence with practice sessions for your next interview.", path: "/demo-interview" },
  { icon: CalendarCheck2, title: "Interview scheduling", description: "Keep practice sessions and interview activities organized.", path: "/demo-interview" },
  { icon: BarChart3, title: "Application tracking", description: "Follow your submitted applications from your student profile.", path: "/profile" },
  { icon: GraduationCap, title: "Student career development", description: "Find practical tools to prepare for the world of work.", path: "/ats-resume" },
];

const steps = [
  { number: "01", title: "Create your profile", description: "Share your skills, education, and resume with hiring teams." },
  { number: "02", title: "Explore jobs and apply", description: "Find roles that fit your ambitions and submit applications." },
  { number: "03", title: "Prepare and get hired", description: "Practice interviews and track your career journey." },
];

const Home = () => {
  useGetAllJobs();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedLocation = searchParams.get("location") || "All India";
  const { user } = useSelector((store) => store.auth);
  const { allJobs = [] } = useSelector((store) => store.job);
  const [companies, setCompanies] = useState([]);
  const [availableLocations, setAvailableLocations] = useState([]);
  const [companyError, setCompanyError] = useState("");
  const activeJobCounts = useMemo(() => allJobs.reduce((counts, job) => {
    const companyId = job.company?._id;
    if (companyId) counts[companyId] = (counts[companyId] || 0) + 1;
    return counts;
  }, {}), [allJobs]);
  const hiringCompanies = companies
    .filter((company) => activeJobCounts[company._id])
    .slice(0, 8);

  useEffect(() => {
    if (user?.role === "recruiter") navigate("/admin/dashboard");
  }, [navigate, user]);

  useEffect(() => {
    const controller = new AbortController();
    const fetchIndianCompanies = async () => {
      try {
        setCompanyError("");
        const params = selectedLocation !== "All India" ? { location: selectedLocation } : {};
        const response = await axios.get(`${COMPANY_API_ENDPOINT}/public`, {
          params,
          signal: controller.signal,
        });
        if (!response.data.success) throw new Error("Unable to load India-based companies.");
        setCompanies(response.data.companies || []);
        setAvailableLocations(response.data.locations || []);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Indian company lookup failed:", error);
          setCompanies([]);
          setCompanyError(error?.response?.data?.message || "Unable to load companies.");
          toast.error(error?.response?.data?.message || "Unable to load companies.");
        }
      }
    };

    fetchIndianCompanies();
    return () => controller.abort();
  }, [selectedLocation]);

  const applyLocationFilter = (event) => {
    event.preventDefault();
    const location = event.currentTarget.elements.location.value.trim();
    if (location.toLowerCase() !== "all india" && !availableLocations.includes(location)) {
      toast.error("Choose an available Indian location from the dropdown.");
      return;
    }

    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (location.toLowerCase() === "all india") next.delete("location");
      else next.set("location", location);
      return next;
    });
  };

  const searchCompany = (companyName) => {
    dispatch(setSearchedQuery(companyName));
    const params = new URLSearchParams();
    if (selectedLocation !== "All India") params.set("location", selectedLocation);
    navigate(`/browse${params.size ? `?${params.toString()}` : ""}`);
  };

  return (
    <div id="home-top" className="min-h-screen bg-white">
      <Navbar />
      <main>
        <HeroSection />
        <CategoryCarausel />
        <LatestJobs />

        <section id="top-hiring-companies" className="scroll-mt-24 bg-white py-14 sm:py-18">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.15em] text-violet-700">Hiring on Career Nest</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#172554] sm:text-4xl">Top hiring companies</h2>
                <p className="mt-2 text-sm text-slate-500">Meet employers with live opportunities in our job listings.</p>
              </div>
              <Link to={selectedLocation === "All India" ? "/jobs" : `/jobs?location=${encodeURIComponent(selectedLocation)}`} className="inline-flex items-center gap-2 self-start text-sm font-semibold text-violet-800 hover:text-violet-950 sm:self-auto">
                Browse open roles <ArrowRight size={17} />
              </Link>
            </div>

            <form key={selectedLocation} onSubmit={applyLocationFilter} className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="w-full sm:max-w-sm">
                <label htmlFor="home-company-location" className="text-sm font-medium text-slate-700">Company and job location</label>
                <Input
                  id="home-company-location"
                  name="location"
                  list="home-india-locations"
                  defaultValue={selectedLocation}
                  className="mt-2 h-11"
                  placeholder="All India"
                />
                <datalist id="home-india-locations">
                  <option value="All India" />
                  {availableLocations.map((location) => <option key={location} value={location} />)}
                </datalist>
              </div>
              <button type="submit" className="h-11 rounded-xl bg-violet-700 px-5 text-sm font-semibold text-white transition hover:bg-violet-800">
                Apply location
              </button>
            </form>

            {hiringCompanies.length ? (
              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {hiringCompanies.map((company) => (
                  <button
                    key={company._id}
                    type="button"
                    onClick={() => searchCompany(company.name)}
                    className="group flex min-h-32 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-5 text-center transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md"
                    aria-label={`View jobs at ${company.name}`}
                  >
                    {company.logo ? (
                      <img src={company.logo} alt={`${company.name} logo`} className="h-12 w-12 rounded-xl object-contain" />
                    ) : (
                      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-lg font-semibold text-violet-800">
                        {company.name?.charAt(0) || <Building2 size={20} />}
                      </span>
                    )}
                    <span className="mt-3 line-clamp-1 text-sm font-semibold text-slate-900">{company.name}</span>
                    <span className="mt-1 text-xs text-slate-500">
                      {activeJobCounts[company._id]} open roles · {company.location}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
                {companyError || (selectedLocation !== "All India"
                  ? `No India-based companies with open jobs are available in ${selectedLocation}.`
                  : "Company profiles will appear here as employers publish opportunities.")}
              </div>
            )}
          </div>
        </section>

        <section id="student-opportunities" className="scroll-mt-24 bg-[#F8FAFC] py-14 sm:py-18">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-violet-700">Made for the next generation</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#172554] sm:text-4xl">Career opportunities for students</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Whether you're still studying or ready to graduate, find a path to start your career.</p>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {careerLinks.map(({ title, description, icon: Icon, query, path }) => (
                <Link
                  key={title}
                  to={path}
                  onClick={() => dispatch(setSearchedQuery(query))}
                  className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700 transition group-hover:bg-violet-700 group-hover:text-white"><Icon size={20} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-slate-900">{title}</span>
                    <span className="mt-1 block text-sm text-slate-500">{description}</span>
                  </span>
                  <ArrowRight size={17} className="shrink-0 text-slate-400 transition group-hover:text-violet-700" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="why-hire-nest" className="scroll-mt-24 bg-white py-14 sm:py-18">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-violet-700">More than a job search</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#172554] sm:text-4xl">Everything you need for your next step</h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">Discover opportunities and prepare to make the most of them.</p>
            </div>
            <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ icon: Icon, title, description, path }) => (
                <Link key={title} to={path} className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-700"><Icon size={20} /></span>
                  <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#F8FAFC] py-14 sm:py-18">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.15em] text-violet-700">How it works</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#172554] sm:text-4xl">Your journey, made simple</h2>
                <p className="mt-4 max-w-md text-sm leading-6 text-slate-500">Three steps to move from exploring opportunities to feeling ready for your next interview.</p>
                <Link to="/signup" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-800">
                  Create your profile <ArrowRight size={17} />
                </Link>
              </div>
              <div className="space-y-3">
                {steps.map((step) => (
                  <article key={step.number} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:gap-5">
                    <span className="text-sm font-semibold tracking-wide text-violet-700">{step.number}</span>
                    <div>
                      <h3 className="font-semibold text-slate-900">{step.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-500">{step.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#172554] px-5 py-14 text-white sm:px-8 sm:py-16">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-7 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-sm font-medium text-violet-200"><GraduationCap size={18} /> Your next chapter starts here</div>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Your Career Journey Starts Here!</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-200">Join Career Nest today and discover opportunities that match your skills and ambitions.</p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link to="/signup" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white transition hover:bg-violet-500">
                Register Now <ArrowRight size={17} />
              </Link>
              <Link to="/jobs" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/30 px-5 text-sm font-semibold text-white transition hover:bg-white/10">
                Explore Jobs <BriefcaseBusiness size={17} />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
