import { useEffect } from "react";
import Navbar from "../shared/Navbar";
import ApplicantsTable from "./ApplicantsTable";
import axios from "axios";
import { APPLICANT_API_ENDPOINT } from "@/utils/constant";
import { useParams } from "react-router-dom";
import { setAllApplication } from "@/redux/applicationSlice";
import { useDispatch, useSelector } from "react-redux";
import {
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  Users,
  UserRoundCheck,
  XCircle,
} from "lucide-react";
import { motion } from "framer-motion";

const summaryStages = [
  { key: "all", label: "Total applicants", icon: Users, tone: "violet" },
  { key: "applied", label: "Applied", icon: BriefcaseBusiness, tone: "blue" },
  { key: "shortlisted", label: "Shortlisted", icon: UserRoundCheck, tone: "amber" },
  { key: "interview scheduled", label: "Interview scheduled", icon: Clock3, tone: "purple" },
  { key: "selected", label: "Selected", icon: CheckCircle2, tone: "green" },
  { key: "rejected", label: "Rejected", icon: XCircle, tone: "rose" },
];

const summaryStage = (status) => {
  const stage = String(status || "applied").trim().toLowerCase();
  if (["pending"].includes(stage)) return "applied";
  if (["interview"].includes(stage)) return "interview scheduled";
  if (["hired", "offer issued", "offer extended", "offer accepted", "selected"].includes(stage)) return "selected";
  if (["declined", "offer rejected", "interview not cleared", "rejected"].includes(stage)) return "rejected";
  if (["interview cleared"].includes(stage)) return "selected";
  return stage;
};

const Applicants = () => {
  const params = useParams();
  const dispatch = useDispatch();

  const { applicants } = useSelector(
    (store) => store.application
  );
  const applications = applicants?.applications || [];
  const stageCounts = applications.reduce((counts, application) => {
    const stage = summaryStage(application.status);
    counts[stage] = (counts[stage] || 0) + 1;
    return counts;
  }, {});

  useEffect(() => {
    let active = true;
    let timeoutId;

    const fetchAllApplicants = async () => {
      try {
        const res = await axios.get(
          `${APPLICANT_API_ENDPOINT}/${params.id}/applicants`,
          { withCredentials: true }
        );
        if (active && res.data.success) dispatch(setAllApplication(res.data.job));
      } catch (error) {
        if (active) console.error("Applicant status refresh failed:", error);
      } finally {
        if (active) timeoutId = setTimeout(fetchAllApplicants, 15000);
      }
    };

    fetchAllApplicants();
    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, [params.id, dispatch]);

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-slate-50/70">
        <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
          <motion.section
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex flex-col gap-5 rounded-2xl border border-violet-100 bg-white p-5 shadow-sm sm:p-7 lg:flex-row lg:items-end lg:justify-between"
          >
            <div>
              <p className="mb-2 text-sm font-semibold text-violet-700">Recruiter workspace</p>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Job Applicants
              </h1>
              <p className="mt-2 text-sm text-slate-500 sm:text-base">
                Review candidates and keep every hiring decision moving.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-violet-50 px-4 py-3 text-violet-800">
              <Users className="h-5 w-5" />
              <span className="text-sm font-medium">Applications for this job</span>
            </div>
          </motion.section>

          <section aria-label="Applicant summary" className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            {summaryStages.map(({ key, label, icon: Icon, tone }) => {
              const tones = {
                violet: "bg-violet-50 text-violet-700",
                blue: "bg-blue-50 text-blue-700",
                amber: "bg-amber-50 text-amber-700",
                purple: "bg-purple-50 text-purple-700",
                green: "bg-emerald-50 text-emerald-700",
                rose: "bg-rose-50 text-rose-700",
              };
              return (
                <div key={key} className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
                  <div className={`mb-4 flex h-9 w-9 items-center justify-center rounded-lg ${tones[tone]}`}>
                    <Icon className="h-[18px] w-[18px]" />
                  </div>
                  <p className="text-2xl font-bold tracking-tight text-slate-900">
                    {key === "all" ? applications.length : stageCounts[key] || 0}
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">{label}</p>
                </div>
              );
            })}
          </section>

          <ApplicantsTable />
        </main>
      </div>
    </>
  );
};

export default Applicants;