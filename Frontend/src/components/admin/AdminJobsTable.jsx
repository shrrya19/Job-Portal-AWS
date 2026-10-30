import { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";

import {
  Edit2,
  Eye,
  MoreHorizontal,
  BriefcaseBusiness,
  Trash2,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { JOB_API_ENDPOINT } from "@/utils/constant";
import { toast } from "sonner";
import { deleteAdminJob } from "@/redux/jobSlice";

const AdminJobsTable = () => {
  const { allAdminJobs = [], searchJobByText } =
    useSelector((store) => store.job);

  const [deletingId, setDeletingId] = useState("");
  const filterJobs = allAdminJobs.filter((job) => {
    if (!searchJobByText) return true;
    const search = searchJobByText.toLowerCase();
    return job?.title?.toLowerCase().includes(search)
      || job?.company?.name?.toLowerCase().includes(search);
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const deleteJob = async (job) => {
    if (!window.confirm(`Delete "${job.title}" and its applications?`)) return;
    setDeletingId(job._id);
    try {
      const res = await axios.delete(`${JOB_API_ENDPOINT}/delete/${job._id}`, {
        withCredentials: true,
      });
      if (res.data.success) {
        dispatch(deleteAdminJob(job._id));
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to delete this job.");
    } finally {
      setDeletingId("");
    }
  };

  if (filterJobs.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-purple-100 p-16 text-center">

        <BriefcaseBusiness
          size={55}
          className="mx-auto text-[#6A38C2]"
        />

        <h2 className="text-2xl font-bold mt-4">
          No Jobs Found
        </h2>

        <p className="text-gray-500 mt-2">
          Create your first job posting to start
          receiving applications.
        </p>

      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-purple-100 overflow-hidden">

      <Table>

        <TableCaption className="py-4">
          Recent Posted Jobs
        </TableCaption>

        <TableHeader>

          <TableRow className="bg-purple-50">

            <TableHead className="font-semibold text-[#6A38C2]">
              Company
            </TableHead>

            <TableHead className="font-semibold text-[#6A38C2]">
              Role
            </TableHead>

            <TableHead className="font-semibold text-[#6A38C2]">
              Posted Date
            </TableHead>

            <TableHead className="text-right font-semibold text-[#6A38C2]">
              Actions
            </TableHead>

          </TableRow>

        </TableHeader>

        <TableBody>

          {filterJobs.map((job, index) => (
            <motion.tr
              key={job._id}
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
                  {job?.company?.name}
                </div>
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-2">

                  <span className="h-2 w-2 rounded-full bg-green-500"></span>

                  <span className="font-medium">
                    {job?.title}
                  </span>

                </div>
              </TableCell>

              <TableCell>
                {job?.createdAt?.split("T")[0]}
              </TableCell>

              <TableCell className="text-right">

                <Popover>

                  <PopoverTrigger>
                    <MoreHorizontal className="cursor-pointer hover:text-[#6A38C2]" />
                  </PopoverTrigger>

                  <PopoverContent className="w-40">

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/admin/jobs/${job._id}/edit`
                        )
                      }
                      className="flex w-full items-center gap-2 text-left hover:text-[#6A38C2] transition-all"
                    >
                      <Edit2 size={16} />
                      <span>Edit Job</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/admin/jobs/${job._id}/applicants`
                        )
                      }
                      className="mt-3 flex w-full items-center gap-2 text-left hover:text-[#6A38C2] transition-all"
                    >
                      <Eye size={16} />
                      <span>Applicants</span>
                    </button>

                    <button
                      type="button"
                      disabled={deletingId === job._id}
                      onClick={() => deleteJob(job)}
                      className="mt-3 flex w-full items-center gap-2 text-left text-red-600 transition-all hover:text-red-700 disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                      <span>{deletingId === job._id ? "Deleting..." : "Delete Job"}</span>
                    </button>

                  </PopoverContent>

                </Popover>

              </TableCell>

            </motion.tr>
          ))}

        </TableBody>

      </Table>

    </div>
  );
};

export default AdminJobsTable;