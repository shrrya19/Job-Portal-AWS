import {
  ArrowUpRight,
  BrainCircuit,
  Cloud,
  Code2,
  Database,
  Palette,
  Search,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setSearchedQuery } from "@/redux/jobSlice";

const categories = [
  { name: "Software Development", search: "software", icon: Code2, terms: ["software", "developer", "engineer", "programming"] },
  { name: "Web Development", search: "web", icon: Smartphone, terms: ["web", "frontend", "front-end", "backend", "full stack", "react", "node"] },
  { name: "Data Science", search: "data", icon: Database, terms: ["data", "analytics", "analyst"] },
  { name: "Artificial Intelligence", search: "Artificial Intelligence", icon: BrainCircuit, terms: ["artificial intelligence", "machine learning", "ai ", " llm"] },
  { name: "Cloud Computing", search: "cloud", icon: Cloud, terms: ["cloud", "aws", "azure", "devops"] },
  { name: "UI/UX Design", search: "design", icon: Palette, terms: ["design", "ui", "ux", "product designer"] },
  { name: "Cybersecurity", search: "security", icon: ShieldCheck, terms: ["security", "cybersecurity", "cyber security"] },
  { name: "Digital Marketing", search: "marketing", icon: Search, terms: ["marketing", "seo", "digital"] },
];

const CategoryCarausel = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { allJobs = [] } = useSelector((store) => store.job);

  const findCount = (terms) => allJobs.filter((job) => {
    const searchable = [
      job.title,
      job.description,
      job.company?.name,
      ...(Array.isArray(job.requirements) ? job.requirements : []),
    ].join(" ").toLowerCase();
    return terms.some((term) => searchable.includes(term));
  }).length;

  const searchJobs = (query) => {
    dispatch(setSearchedQuery(query));
    navigate("/browse");
  };

  return (
    <section id="categories" className="scroll-mt-24 bg-white py-14 sm:py-18">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-violet-700">Explore opportunities</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#172554] sm:text-4xl">Browse by category</h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-slate-500">Explore roles across the fields shaping tomorrow.</p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map(({ name, search, icon: Icon, terms }) => {
            const count = findCount(terms);
            return (
              <button
                key={name}
                type="button"
                onClick={() => searchJobs(search)}
                className="group flex min-h-32 items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md sm:p-5"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700 transition group-hover:bg-violet-700 group-hover:text-white">
                  <Icon size={20} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold leading-5 text-slate-900">{name}</span>
                  <span className="mt-2 block text-xs text-slate-500">
                    {count} {count === 1 ? "job" : "jobs"}
                  </span>
                </span>
                <ArrowUpRight size={16} className="shrink-0 text-slate-400 transition group-hover:text-violet-700" />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryCarausel;
