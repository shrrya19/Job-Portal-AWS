import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

import { FileText, Users } from "lucide-react";
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

const stages = ["applied", "shortlisted", "interview", "offer extended", "hired", "declined"];
const normalizeStage = (status) => {
  if (status === "accepted") return "hired";
  if (status === "rejected") return "declined";
  if (status === "pending") return "applied";
  return stages.includes(status) ? status : "applied";
};

const ApplicantsTable = () => {
  const dispatch = useDispatch();
  const { applicants } = useSelector(
    (store) => store.application
  );

  const statusHandler = async (status, id) => {
    try {
      const res = await axios.post(
        `${APPLICANT_API_ENDPOINT}/status/${id}/update`,
        { status },
        { withCredentials: true }
      );

      if (res.data.success) {
        dispatch(updateApplicantStage({
          applicationId: id,
          status: res.data.application.status,
          stageDetails: res.data.application.stageDetails,
          stageHistory: res.data.application.stageHistory,
        }));
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Something went wrong"
      );
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
              Action
            </TableHead>

          </TableRow>

        </TableHeader>

        <TableBody>

          {applicants?.applications?.map((item, index) => {
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
                    <ApplicationStageTracker status={status} stageHistory={item.stageHistory} />
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
                  <Select value={status} onValueChange={(nextStatus) => statusHandler(nextStatus, item._id)}>
                    <SelectTrigger className="ml-auto w-44">
                      <SelectValue placeholder="Update stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {stages.map((stage) => (
                        <SelectItem key={stage} value={stage}>
                          {stage.replace(/\b\w/g, (letter) => letter.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>

              </motion.tr>
            );
          })}

        </TableBody>

      </Table>
    </div>
  );
};

export default ApplicantsTable;