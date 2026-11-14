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
  { title: "Fresher Jobs", description: "Start building experience with top recruiters", icon: GraduationCap, query: "", path: "/browse?experience=0-1" },
  { title: "Internship Opportunities", description: "Learn real-world skills while you study", icon: BriefcaseBusiness, query: "", path: "/internships" },
  { title: "Entry-Level Roles", description: "Take your first decisive career step", icon: UserRoundCheck, query: "", path: "/browse?experience=0-1" },
  { title: "Work From Home Jobs", description: "Flexible remote opportunities across tech", icon: House, query: "", path: "/browse?location=remote" },
  { title: "Graduate Trainee Positions", description: "Accelerated growth tracks for fresh grads", icon: BarChart3, query: "graduate trainee", path: "/browse" },
];

const features = [
  { icon: BriefcaseBusiness, title: "Smart Job Recommendations", description: "AI-matched job and internship openings curated directly for your target skills and qualifications.", path: "/jobs" },
  { icon: FileCheck2, title: "ATS Resume Builder", description: "Build professional ATS-friendly resumes and check your score against live job descriptions.", path: "/ats-resume" },
  { icon: Video, title: "AI-Based Mock Interviews", description: "Build speaking confidence with automated voice & text mock interview sessions.", path: "/demo-interview" },
  { icon: CalendarCheck2, title: "Interview Scheduling", description: "Seamlessly schedule, track, and attend recruiter & practice interviews in one place.", path: "/demo-interview" },
  { icon: BarChart3, title: "Application Tracking", description: "Real-time pipeline monitoring: applied → shortlisted → interview → offer → hired.", path: "/student/dashboard" },
  { icon: GraduationCap, title: "Student Career Development", description: "Holistic student-focused tools, guidance, and campus recruitment opportunities.", path: "/ats-resume" },
];

const steps = [
  { number: "Step 1", title: "Create Your Profile", description: "Upload your resume, showcase technical skills, and let top hiring companies discover your talent." },
  { number: "Step 2", title: "Explore Jobs and Apply", description: "Browse thousands of verified student jobs and internships with one-click applications." },
  { number: "Step 3", title: "Prepare for Interviews and Get Hired", description: "Practice role-specific mock questions, track live pipeline progress, and accept offers." },
];

const featuredCorporates = [
  { name: "Google", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg", roles: "45+ Openings", location: "Bengaluru, Hyderabad" },
  { name: "Microsoft", logo: "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg", roles: "38+ Openings", location: "Bengaluru, Noida" },
  { name: "Amazon", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg", roles: "52+ Openings", location: "Bengaluru, Chennai" },
  { name: "Infosys", logo: "https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg", roles: "60+ Openings", location: "Pune, Bengaluru" },
  { name: "Wipro", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a0/Wipro_Primary_Logo_Color_RGB.svg", roles: "30+ Openings", location: "Bengaluru, Hyderabad" },
  { name: "TCS", logo: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg", roles: "75+ Openings", location: "Mumbai, Chennai" },
  { name: "Accenture", logo: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Accenture.svg", roles: "40+ Openings", location: "Gurugram, Bengaluru" },
  { name: "Capgemini", logo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Capgemini_logo_high_res.svg", roles: "35+ Openings", location: "Pune, Mumbai" },
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

        <section id="top-hiring-companies" className="scroll-mt-24 bg-white py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-violet-700">Top Employers</p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#172554] sm:text-4xl">Top Hiring Companies</h2>
                <p className="mt-2 text-sm text-slate-500">Connect with industry leaders actively hiring students and fresh graduates.</p>
              </div>
              <Link to="/jobs" className="inline-flex items-center gap-2 self-start text-sm font-semibold text-violet-800 hover:text-violet-950 sm:self-auto">
                Browse all companies <ArrowRight size={17} />
              </Link>
            </div>

            {/* Featured Major Corporates as requested: Google, Microsoft, Amazon, Infosys, Wipro, TCS, Accenture, Capgemini */}
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {featuredCorporates.map((corp) => (
                <button
                  key={corp.name}
                  type="button"
                  onClick={() => searchCompany(corp.name)}
                  className="group flex min-h-36 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-5 text-center transition duration-200 hover:-translate-y-1 hover:border-violet-300 hover:shadow-lg"
                  aria-label={`View jobs at ${corp.name}`}
                >
                  <img
                    src={corp.logo}
                    alt={`${corp.name} logo`}
                    className="h-10 w-24 object-contain transition duration-200 group-hover:scale-105"
                    loading="lazy"
                  />
                  <span className="mt-3 block text-sm font-bold text-slate-900">{corp.name}</span>
                  <span className="mt-1 inline-flex items-center rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-medium text-violet-700">
                    {corp.roles}
                  </span>
                  <span className="mt-1 block text-[11px] text-slate-400">{corp.location}</span>
                </button>
              ))}
            </div>

            {hiringCompanies.length > 0 && (
              <div className="mt-10 border-t border-slate-100 pt-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">More Employers Hiring on Hire Nest</p>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {hiringCompanies.map((company) => (
                    <button
                      key={company._id}
                      type="button"
                      onClick={() => searchCompany(company.name)}
                      className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-left transition hover:border-violet-200 hover:bg-white hover:shadow-sm"
                    >
                      {company.logo ? (
                        <img src={company.logo} alt={`${company.name} logo`} className="h-9 w-9 rounded-lg object-contain bg-white p-1 border border-slate-100" />
                      ) : (
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 text-sm font-bold text-violet-800">
                          {company.name?.charAt(0) || <Building2 size={16} />}
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-slate-900">{company.name}</p>
                        <p className="truncate text-[11px] text-slate-500">{activeJobCounts[company._id] || 1} open roles</p>
                      </div>
                    </button>
                  ))}
                </div>
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

        <section id="why-hire-nest" className="scroll-mt-24 bg-white py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-violet-700">Platform Features</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#172554] sm:text-4xl">Why Choose Hire Nest?</h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">Everything ambitious students and fresh graduates need to launch a rewarding career.</p>
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ icon: Icon, title, description, path }) => (
                <Link
                  key={title}
                  to={path}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 transition duration-200 hover:-translate-y-1 hover:border-violet-300 hover:shadow-lg"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-700 transition duration-200 group-hover:bg-violet-700 group-hover:text-white">
                    <Icon size={22} />
                  </span>
                  <h3 className="mt-5 text-base font-bold text-slate-900 group-hover:text-violet-700 transition">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#F8FAFC] py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-violet-700">Simple &amp; Transparent</p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#172554] sm:text-4xl">How Hire Nest Works</h2>
                <p className="mt-4 max-w-md text-sm leading-6 text-slate-500">A clear three-step pathway from college student to hired professional.</p>
                <Link to="/signup" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-700 px-6 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-violet-800 hover:shadow-lg">
                  Create Your Profile <ArrowRight size={17} />
                </Link>
              </div>
              <div className="space-y-4">
                {steps.map((step) => (
                  <article key={step.number} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-violet-200 hover:shadow-md sm:gap-5">
                    <span className="flex h-9 w-18 shrink-0 items-center justify-center rounded-lg bg-violet-50 px-2.5 text-xs font-bold tracking-wide text-violet-700">
                      {step.number}
                    </span>
                    <div>
                      <h3 className="font-bold text-slate-900">{step.title}</h3>
                      <p className="mt-1.5 text-sm leading-6 text-slate-500">{step.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#172554] px-5 py-14 text-white sm:px-8 sm:py-18">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-7 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-violet-200">
                <GraduationCap size={15} /> Your next chapter starts here
              </div>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Your Career Journey Starts Here!</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-200">
                Join Hire Nest today and discover opportunities that match your skills and ambitions.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link to="/signup" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 text-sm font-semibold text-white shadow-md transition hover:bg-violet-500 hover:shadow-lg">
                Register Now <ArrowRight size={17} />
              </Link>
              <Link to="/jobs" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/30 px-6 text-sm font-semibold text-white transition hover:bg-white/10">
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
