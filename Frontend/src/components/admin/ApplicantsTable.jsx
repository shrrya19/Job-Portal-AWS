import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

import { FileText, Save, Search, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { APPLICANT_API_ENDPOINT } from "@/utils/constant";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Badge } from "../ui/badge";
import { updateApplicantStage } from "@/redux/applicationSlice";
import ApplicationStageTracker from "../shared/ApplicationStageTracker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const recruiterStages = [
  "applied",
  "under review",
  "shortlisted",
  "interview scheduled",
  "interview cleared",
  "interview not cleared",
  "offer issued",
  "selected",
  "rejected",
];
const stages = [...recruiterStages, "offer accepted", "offer rejected"];
const stageLabel = (stage) => ({
  "interview not cleared": "Interview not cleared",
  "interview cleared": "Interview cleared",
  "offer issued": "Offer issued",
  "offer accepted": "Offer accepted",
  "offer rejected": "Offer rejected",
}[stage] || stage.replace(/\b\w/g, (letter) => letter.toUpperCase()));
const normalizeStage = (status) => {
  if (status === "accepted" || status === "hired") return "offer accepted";
  if (status === "offer extended") return "offer issued";
  if (status === "declined") return "rejected";
  if (status === "interview") return "interview scheduled";
  if (status === "pending") return "applied";
  return [...stages, "offer accepted", "offer rejected"].includes(status) ? status : "applied";
};
const trackerStage = (status) => ({
  "under review": "applied",
  selected: "offer issued",
  "offer extended": "offer issued",
}[status] || status);
const toDateTimeInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const ApplicantsTable = () => {
  const dispatch = useDispatch();
  const [notesByApplication, setNotesByApplication] = useState({});
  const [detailsByApplication, setDetailsByApplication] = useState({});
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const { applicants } = useSelector(
    (store) => store.application
  );
  const visibleApplications = useMemo(() => (applicants?.applications || []).filter((item) => {
    const status = normalizeStage(item.status);
    const matchesStatus = statusFilter === "all" || status === statusFilter;
    const query = search.trim().toLowerCase();
    const matchesSearch = !query ||
      item.applicant?.fullName?.toLowerCase().includes(query) ||
      item.applicant?.email?.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  }), [applicants?.applications, search, statusFilter]);

  const statusHandler = async (status, item) => {
    const savedDetails = item.stageDetails || {};
    const draftDetails = detailsByApplication[item._id] || {};
    const interviewDate = draftDetails.interviewDate ?? toDateTimeInput(savedDetails.interviewDate);
    const interviewTime = draftDetails.interviewTime ?? savedDetails.interviewTime ?? "";
    const interviewMode = draftDetails.interviewMode ?? savedDetails.interviewMode ?? "";
    const offerSalary = draftDetails.offerSalary ?? savedDetails.offerSalary ?? "";
    const payload = { status };

    if (status === "interview scheduled") {
      if (!interviewDate || new Date(interviewDate) <= new Date() || !interviewTime.trim() || !interviewMode) {
        toast.error("Add a future interview date, time, and format before scheduling.");
        return;
      }
      payload.interviewDate = new Date(interviewDate).toISOString();
      payload.interviewTime = interviewTime.trim();
      payload.interviewMode = interviewMode;
    }
    if (status === "offer issued") {
      if (!offerSalary.trim()) {
        toast.error("Enter the offer salary or compensation details before issuing the offer.");
        return;
      }
      payload.offerSalary = offerSalary.trim();
    }

    try {
      const res = await axios.post(
        `${APPLICANT_API_ENDPOINT}/status/${item._id}/update`,
        payload,
        { withCredentials: true }
      );

      if (res.data.success) {
        dispatch(updateApplicantStage({
          applicationId: item._id,
          status: res.data.application.status,
          stageDetails: res.data.application.stageDetails,
          stageHistory: res.data.application.stageHistory,
          recruiterNotes: res.data.application.recruiterNotes,
        }));
        setDetailsByApplication((current) => ({ ...current, [item._id]: {} }));
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Something went wrong"
      );
    }
  };

  const saveNotes = async (item) => {
    try {
      const recruiterNotes = notesByApplication[item._id] ?? item.recruiterNotes ?? "";
      const res = await axios.post(
        `${APPLICANT_API_ENDPOINT}/status/${item._id}/update`,
        { recruiterNotes },
        { withCredentials: true }
      );
      if (res.data.success) {
        dispatch(updateApplicantStage({
          applicationId: item._id,
          status: item.status,
          recruiterNotes: res.data.application.recruiterNotes,
        }));
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to save recruiter notes.");
    }
  };

  if (
    !applicants?.applications ||
    applicants.applications.length === 0
  ) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-purple-100 p-16 text-center">

        <Users
          size={55}
          className="mx-auto text-[#6A38C2]"
        />

        <h2 className="text-2xl font-bold mt-4">
          No Applicants Yet
        </h2>

        <p className="text-gray-500 mt-2">
          Applications will appear here when
          candidates apply for this job.
        </p>

      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-purple-100 overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">{visibleApplications.length} of {applicants.applications.length} applications</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="relative">
            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search candidates" className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-violet-500 sm:w-56" />
          </label>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700">
            <option value="all">All statuses</option>
            {stages.map((stage) => <option key={stage} value={stage}>{stageLabel(stage)}</option>)}
          </select>
        </div>
      </div>

      <Table>

        <TableCaption className="py-4">
          Recent Job Applications
        </TableCaption>

        <TableHeader>

          <TableRow className="bg-purple-50">

            <TableHead className="text-[#6A38C2] font-semibold">
              Candidate
            </TableHead>

            <TableHead className="text-[#6A38C2] font-semibold">
              Email
            </TableHead>

            <TableHead className="text-[#6A38C2] font-semibold">
              Contact
            </TableHead>

            <TableHead className="text-[#6A38C2] font-semibold">
              Resume
            </TableHead>

            <TableHead className="text-[#6A38C2] font-semibold">
              Applied On
            </TableHead>

            <TableHead className="text-right text-[#6A38C2] font-semibold">
                Application stage
            </TableHead>

          </TableRow>

        </TableHeader>

        <TableBody>

          {visibleApplications.map((item, index) => {
            const status = normalizeStage(item.status);
            return (
              <motion.tr
                key={item._id}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: index * 0.05,
                }}
                className="hover:bg-purple-50/60 transition-all duration-300"
              >

                <TableCell>
                  <div className="font-semibold">
                    {
                      item?.applicant
                        ?.fullName
                    }
                  </div>
                  <div className="mt-2">
                    <ApplicationStageTracker status={trackerStage(status)} stageHistory={item.stageHistory} />
                  </div>
                </TableCell>

                <TableCell>
                  {
                    item?.applicant
                      ?.email
                  }
                </TableCell>

                <TableCell>
                  {
                    item?.applicant
                      ?.phoneNumber
                  }
                </TableCell>

                <TableCell>
                  {item?.applicant?.profile
                    ?.resume ? (
                    <a
                      href={
                        item?.applicant
                          ?.profile
                          ?.resume
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-[#6A38C2] hover:underline font-medium"
                    >
                      <FileText size={16} />
                      {
                        item?.applicant
                          ?.profile
                          ?.resumeOriginalName
                      }
                    </a>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-gray-500"
                    >
                      No Resume
                    </Badge>
                  )}
                </TableCell>

                <TableCell>
                  {item?.createdAt?.split(
                    "T"
                  )[0]}
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex flex-col items-end gap-2">
                  <Select value={status} onValueChange={(nextStatus) => statusHandler(nextStatus, item)}>
                    <SelectTrigger className="ml-auto w-44">
                      <SelectValue placeholder="Update stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {recruiterStages.map((stage) => (
                        <SelectItem key={stage} value={stage}>
                          {stageLabel(stage)}
                        </SelectItem>
                      ))}
                      {!recruiterStages.includes(status) && (
                        <SelectItem value={status} disabled>{stageLabel(status)}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <div className="w-52 space-y-2 rounded-lg border border-slate-100 bg-slate-50 p-2 text-left">
                    <p className="text-[11px] font-semibold text-slate-600">Interview details (when scheduling)</p>
                    <input
                      type="datetime-local"
                      aria-label={`Interview date and time for ${item.applicant?.fullName || "candidate"}`}
                      value={detailsByApplication[item._id]?.interviewDate ?? toDateTimeInput(item.stageDetails?.interviewDate)}
                      onChange={(event) => setDetailsByApplication((current) => ({
                        ...current,
                        [item._id]: { ...current[item._id], interviewDate: event.target.value },
                      }))}
                      className="w-full rounded-md border border-slate-200 bg-white p-2 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Interview time (e.g. 10:30 AM)"
                      aria-label={`Interview time for ${item.applicant?.fullName || "candidate"}`}
                      value={detailsByApplication[item._id]?.interviewTime ?? item.stageDetails?.interviewTime ?? ""}
                      onChange={(event) => setDetailsByApplication((current) => ({
                        ...current,
                        [item._id]: { ...current[item._id], interviewTime: event.target.value },
                      }))}
                      className="w-full rounded-md border border-slate-200 bg-white p-2 text-xs"
                    />
                    <select
                      aria-label={`Interview format for ${item.applicant?.fullName || "candidate"}`}
                      value={detailsByApplication[item._id]?.interviewMode ?? item.stageDetails?.interviewMode ?? ""}
                      onChange={(event) => setDetailsByApplication((current) => ({
                        ...current,
                        [item._id]: { ...current[item._id], interviewMode: event.target.value },
                      }))}
                      className="w-full rounded-md border border-slate-200 bg-white p-2 text-xs"
                    >
                      <option value="">Select format</option>
                      <option value="Online">Online</option>
                      <option value="Offline">Offline</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                    <p className="text-[11px] font-semibold text-slate-600">Offer compensation (when issuing)</p>
                    <input
                      type="text"
                      maxLength={100}
                      placeholder="e.g. ₹12 LPA"
                      aria-label={`Offer compensation for ${item.applicant?.fullName || "candidate"}`}
                      value={detailsByApplication[item._id]?.offerSalary ?? item.stageDetails?.offerSalary ?? ""}
                      onChange={(event) => setDetailsByApplication((current) => ({
                        ...current,
                        [item._id]: { ...current[item._id], offerSalary: event.target.value },
                      }))}
                      className="w-full rounded-md border border-slate-200 bg-white p-2 text-xs"
                    />
                  </div>
                  <textarea
                    value={notesByApplication[item._id] ?? item.recruiterNotes ?? ""}
                    onChange={(event) => setNotesByApplication((current) => ({ ...current, [item._id]: event.target.value }))}
                    maxLength={5000}
                    rows={2}
                    aria-label={`Recruiter notes for ${item.applicant?.fullName || "candidate"}`}
                    placeholder="Private recruiter notes"
                    className="w-52 rounded-md border border-slate-200 p-2 text-left text-xs outline-none focus:border-violet-500"
                  />
                  <button type="button" onClick={() => saveNotes(item)} className="inline-flex items-center gap-1 text-xs font-medium text-violet-700 hover:text-violet-900">
                    <Save size={13} /> Save notes
                  </button>
                  </div>
                </TableCell>

              </motion.tr>
            );
          })}
          {visibleApplications.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-sm text-slate-500">No applications match these filters.</TableCell>
            </TableRow>
          )}

        </TableBody>

      </Table>
    </div>
  );
};

export default ApplicantsTable;