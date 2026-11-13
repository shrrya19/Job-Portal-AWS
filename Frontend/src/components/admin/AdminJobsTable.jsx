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
  Power,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { JOB_API_ENDPOINT } from "@/utils/constant";
import { toast } from "sonner";
import { deleteAdminJob, updateAdminJob } from "@/redux/jobSlice";

const AdminJobsTable = ({ statusFilter = "All Jobs" }) => {
  const { allAdminJobs = [], searchJobByText } =
    useSelector((store) => store.job);

  const [deletingId, setDeletingId] = useState("");
  const [updatingStatusId, setUpdatingStatusId] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("newest");
  const filterJobs = allAdminJobs.filter((job) => {
    const status = job.status || "Active";
    const matchesStatus = statusFilter === "All Jobs"
      || (statusFilter === "Active Jobs" && status === "Active")
      || (statusFilter === "Inactive Jobs" && status === "Inactive");
    const search = searchJobByText?.trim().toLowerCase();
    const matchesSearch = !search
      || job?.title?.toLowerCase().includes(search)
      || job?.jobId?.toLowerCase().includes(search)
      || job?.company?.name?.toLowerCase().includes(search);
    return matchesStatus && matchesSearch;
  });
  const sortedJobs = [...filterJobs].sort((first, second) => {
    if (sortBy === "oldest") return new Date(first.createdAt) - new Date(second.createdAt);
    if (sortBy === "title") return (first.title || "").localeCompare(second.title || "");
    return new Date(second.createdAt) - new Date(first.createdAt);
  });
  const pageSize = 10;
  const pageCount = Math.max(1, Math.ceil(sortedJobs.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageJobs = sortedJobs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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

  const toggleJobStatus = async (job) => {
    const nextStatus = (job.status || "Active") === "Active" ? "Inactive" : "Active";
    setUpdatingStatusId(job._id);
    try {
      const res = await axios.patch(
        `${JOB_API_ENDPOINT}/status/${job._id}`,
        { status: nextStatus },
        { withCredentials: true }
      );
      if (res.data.success) {
        dispatch(updateAdminJob(res.data.job));
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to update job status.");
    } finally {
      setUpdatingStatusId("");
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
          {allAdminJobs.length
            ? "No jobs match the selected filters."
            : "Create your first job posting to start receiving applications."}
        </p>

      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-purple-100 overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">{filterJobs.length} {filterJobs.length === 1 ? "job" : "jobs"}</p>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          Sort by
          <select
            value={sortBy}
            onChange={(event) => {
              setSortBy(event.target.value);
              setPage(1);
            }}
            className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-slate-700"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="title">Job title</option>
          </select>
        </label>
      </div>

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
              Job ID
            </TableHead>

            <TableHead className="font-semibold text-[#6A38C2]">
              Status
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

          {pageJobs.map((job, index) => (
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

              <TableCell className="font-mono text-sm">
                {job?.jobId || "—"}
              </TableCell>

              <TableCell>
                {(job.status || "Active") === "Active" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-500" />
                    Inactive
                  </span>
                )}
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
                      disabled={updatingStatusId === job._id}
                      onClick={() => toggleJobStatus(job)}
                      className="mt-3 flex w-full items-center gap-2 text-left transition-all hover:text-[#6A38C2] disabled:opacity-50"
                    >
                      <Power size={16} />
                      <span>
                        {updatingStatusId === job._id
                          ? "Updating..."
                          : (job.status || "Active") === "Active"
                            ? "Deactivate job"
                            : "Activate job"}
                      </span>
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
      {filterJobs.length > pageSize && (
        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
          <p className="text-sm text-slate-500">Page {currentPage} of {pageCount}</p>
          <div className="flex gap-2">
            <button type="button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
            <button type="button" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40">Next</button>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminJobsTable;