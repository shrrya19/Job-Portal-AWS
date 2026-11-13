import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { CalendarDays, BriefcaseBusiness, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import ApplicationStageTracker from "./shared/ApplicationStageTracker";
import { Button } from "./ui/button";
import { APPLICANT_API_ENDPOINT } from "@/utils/constant";
import { updateAppliedJobStatus } from "@/redux/jobSlice";

const normalizeStatus = (status = "") => {
  const normalized = status.toLowerCase();
  return ({
    selected: "offer issued",
    "offer extended": "offer issued",
  })[normalized] || normalized;
};

const AppliedJobTable = () => {
  const dispatch = useDispatch();
  const [respondingTo, setRespondingTo] = useState("");
  const jobState = useSelector((store) => store.job);
  const allAppliedJobs = jobState?.allAppliedJobs || [];

  const respondToOffer = async (application, response) => {
    const verb = response === "accepted" ? "accept" : "reject";
    if (!window.confirm(`Are you sure you want to ${verb} this job offer?`)) return;
    setRespondingTo(application._id);
    try {
      const { data } = await axios.post(
        `${APPLICANT_API_ENDPOINT}/status/${application._id}/offer-response`,
        { response },
        { withCredentials: true }
      );
      if (!data.success) throw new Error(data.message || "Unable to submit your offer response.");
      dispatch(updateAppliedJobStatus({
        applicationId: application._id,
        status: data.application.status,
        stageHistory: data.application.stageHistory,
        stageDetails: data.application.stageDetails,
      }));
      toast.success(data.message);
    } catch (error) {
      console.error("Offer response failed:", error);
      toast.error(error?.response?.data?.message || error.message || "Unable to submit your offer response.");
    } finally {
      setRespondingTo("");
    }
  };

  if (allAppliedJobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="bg-purple-100 p-5 rounded-full mb-4">
          <BriefcaseBusiness
            className="text-[#6A38C2]"
            size={40}
          />
        </div>

        <h2 className="text-2xl font-bold text-gray-800">
          No Applications Yet
        </h2>

        <p className="text-gray-500 mt-2">
          Start applying for jobs and track your
          applications here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-purple-100">

      <Table className="min-w-[760px]">

        <TableCaption className="py-4 text-gray-500">
          A list of your applied jobs
        </TableCaption>

        <TableHeader>

          <TableRow className="bg-purple-50 hover:bg-purple-50">

            <TableHead className="font-semibold text-[#6A38C2]">
              Date
            </TableHead>

            <TableHead className="font-semibold text-[#6A38C2]">
              Job Role
            </TableHead>

            <TableHead className="font-semibold text-[#6A38C2]">
              Company
            </TableHead>

            <TableHead className="font-semibold text-[#6A38C2]">
              Interview / Offer
            </TableHead>

            <TableHead className="text-right font-semibold text-[#6A38C2]">
              Status
            </TableHead>

          </TableRow>

        </TableHeader>

        <TableBody>

          {allAppliedJobs.map((appliedJob, index) => (
            <motion.tr
              key={appliedJob._id}
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.3,
                delay: index * 0.05,
              }}
              className="border-b hover:bg-purple-50/50 transition-all duration-300"
            >
              <TableCell className="font-medium">
                {appliedJob?.createdAt?.split("T")[0]}
              </TableCell>

              <TableCell className="font-semibold">
                {appliedJob?.job?.title}
              </TableCell>

              <TableCell>
                {appliedJob?.job?.company?.name}
              </TableCell>

              <TableCell className="min-w-[220px]">
                <div className="space-y-2">
                  {appliedJob?.stageDetails?.interviewDate && (
                    <div className="flex items-start gap-2 text-sm text-slate-700">
                      <CalendarDays size={16} className="mt-0.5 shrink-0 text-violet-600" />
                      <div>
                        <p className="font-medium">Interview details</p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {new Date(appliedJob.stageDetails.interviewDate).toLocaleString()}
                          {appliedJob.stageDetails.interviewTime ? ` · ${appliedJob.stageDetails.interviewTime}` : ""}
                        </p>
                        {appliedJob.stageDetails.interviewMode && (
                          <p className="text-xs text-slate-500">{appliedJob.stageDetails.interviewMode}</p>
                        )}
                      </div>
                    </div>
                  )}
                  {appliedJob?.stageDetails?.offerSalary && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Offer compensation</p>
                      <p className="mt-1 font-medium text-slate-800">{appliedJob.stageDetails.offerSalary}</p>
                    </div>
                  )}
                  {!appliedJob?.stageDetails?.interviewDate && !appliedJob?.stageDetails?.offerSalary && (
                    <span className="text-sm text-slate-400">No interview or offer details yet</span>
                  )}
                </div>
              </TableCell>

              <TableCell>
                <ApplicationStageTracker
                  status={appliedJob?.status || "applied"}
                  stageHistory={appliedJob?.stageHistory}
                />
                {normalizeStatus(appliedJob?.status) === "offer issued" && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      disabled={respondingTo === appliedJob._id}
                      onClick={() => respondToOffer(appliedJob, "accepted")}
                      className="h-8 bg-emerald-600 px-3 text-xs hover:bg-emerald-700"
                    >
                      {respondingTo === appliedJob._id ? <Loader2 size={14} className="mr-1 animate-spin" /> : <CheckCircle2 size={14} className="mr-1" />}
                      Accept offer
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={respondingTo === appliedJob._id}
                      onClick={() => respondToOffer(appliedJob, "rejected")}
                      className="h-8 border-red-200 px-3 text-xs text-red-700 hover:bg-red-50"
                    >
                      <XCircle size={14} className="mr-1" /> Reject offer
                    </Button>
                  </div>
                )}
              </TableCell>
            </motion.tr>
          ))}

        </TableBody>

      </Table>
    </div>
  );
};

export default AppliedJobTable;