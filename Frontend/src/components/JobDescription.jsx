import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Video } from "lucide-react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { JOB_API_ENDPOINT } from "@/utils/constant";
import { APPLICANT_API_ENDPOINT } from "@/utils/constant";
import { setSingleJob } from "@/redux/jobSlice";

const JobDescription = () => {
  const { singleJob } = useSelector((store) => store.job);
  const { user } = useSelector((store) => store.auth);

  const params = useParams();
  const jobId = params.id;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isApplied, setIsApplied] = useState(false);

  const applyJobHandler = async () => {
    try {
      const res = await axios.post(
        `${APPLICANT_API_ENDPOINT}/apply/${jobId}`,
        {},
        {
          withCredentials: true,
        }
      );

      if (res.data.success) {
        setIsApplied(true);

        const updatedJob = {
          ...singleJob,
          applications: [
            ...singleJob.applications,
            {
              applicant: user?._id,
            },
          ],
        };

        dispatch(setSingleJob(updatedJob));
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  useEffect(() => {
    const fetchSingleJob = async () => {
      try {
        const res = await axios.get(
          `${JOB_API_ENDPOINT}/get/${jobId}`,
          {
            withCredentials: true,
          }
        );

        if (res.data.success) {
          dispatch(setSingleJob(res.data.job));

          setIsApplied(
            res.data.job.applications?.some(
              (application) =>
                application.applicant === user?._id
            )
          );
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchSingleJob();
  }, [jobId, dispatch, user?._id]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-white py-10">
      <div className="max-w-6xl mx-auto px-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate(window.history.state?.idx > 0 ? -1 : "/jobs")}
          className="mb-5 rounded-xl border-purple-200 bg-white text-[#6A38C2] hover:bg-purple-50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Jobs
        </Button>

        {/* Main Card */}

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl shadow-xl border border-purple-100 overflow-hidden"
        >

          {/* Top Banner */}

          <div className="h-2 bg-gradient-to-r from-purple-600 via-violet-500 to-orange-500"></div>

          <div className="p-8">

            {/* Hiring Badge */}

            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full font-medium mb-5">
              🔥 Hiring Actively
            </div>

            {/* Header */}

            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">

              <div>

                <h1 className="text-4xl font-bold text-gray-900">
                  {singleJob?.title}
                </h1>

                <p className="text-gray-500 mt-2 text-lg">
                  Build amazing products with our growing team.
                </p>

                <div className="flex flex-wrap gap-3 mt-5">

                  <Badge className="bg-purple-100 text-purple-700">
                    Position : {singleJob?.position}
                  </Badge>

                  <Badge className="bg-orange-100 text-orange-600">
                    {singleJob?.jobType}
                  </Badge>

                  <Badge className="bg-green-100 text-green-700">
                    {singleJob?.salaryMin !== undefined && singleJob?.salaryMax !== undefined
                      ? `₹${singleJob.salaryMin}-${singleJob.salaryMax} ${singleJob.salaryUnit || "LPA"}`
                      : `${singleJob?.salary} ${singleJob?.salaryUnit || "LPA"}`}
                  </Badge>

                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <Link to={`/demo-interview?jobId=${jobId}`}>
                  <Button
                    variant="outline"
                    className="px-6 py-6 text-base rounded-xl font-semibold border-purple-300 text-[#6A38C2] hover:bg-purple-50 shadow-sm"
                  >
                    <Video className="mr-2 h-5 w-5" />
                    Practice Demo Interview
                  </Button>
                </Link>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={!isApplied ? applyJobHandler : null}
                    disabled={isApplied}
                    className={`px-8 py-6 text-lg rounded-xl font-semibold shadow-lg ${
                      isApplied
                        ? "bg-gray-500 cursor-not-allowed"
                        : "bg-[#6D28D9] hover:bg-[#5B21B6]"
                    }`}
                  >
                    {isApplied
                      ? "Already Applied ✓"
                      : "Apply Now 🚀"}
                  </Button>
                </motion.div>
              </div>

            </div>

            {/* Stats */}

            <div className="grid md:grid-cols-4 gap-5 mt-10">

              <motion.div
                whileHover={{ y: -5 }}
                className="bg-purple-50 border border-purple-200 rounded-2xl p-5"
              >
                <h3 className="font-semibold text-purple-700">
                  Position
                </h3>
                <p className="mt-2 text-lg font-bold">
                  {singleJob?.position}
                </p>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="bg-orange-50 border border-orange-200 rounded-2xl p-5"
              >
                <h3 className="font-semibold text-orange-600">
                  Job Type
                </h3>
                <p className="mt-2 text-lg font-bold">
                  {singleJob?.jobType}
                </p>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="bg-green-50 border border-green-200 rounded-2xl p-5"
              >
                <h3 className="font-semibold text-green-600">
                  Salary
                </h3>
                <p className="mt-2 text-lg font-bold">
                  {singleJob?.salaryMin !== undefined && singleJob?.salaryMax !== undefined
                    ? `₹${singleJob.salaryMin}-${singleJob.salaryMax} ${singleJob.salaryUnit || "LPA"}`
                    : `${singleJob?.salary} ${singleJob?.salaryUnit || "LPA"}`}
                </p>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="bg-blue-50 border border-blue-200 rounded-2xl p-5"
              >
                <h3 className="font-semibold text-blue-600">
                  Applicants
                </h3>
                <p className="mt-2 text-lg font-bold">
                  {singleJob?.applications?.length || 0}
                </p>
              </motion.div>

            </div>

            {/* Description */}

            <div className="mt-10 bg-gray-50 border rounded-3xl p-8">

              <h2 className="text-2xl font-bold mb-4 text-gray-900">
                📄 Job Description
              </h2>

              <p className="text-gray-700 leading-8">
                {singleJob?.description}
              </p>

            </div>

            {/* Details */}

            <div className="grid lg:grid-cols-2 gap-6 mt-8">

              <div className="bg-white border border-purple-100 rounded-2xl p-6 shadow-sm">

                <h2 className="font-bold text-xl mb-5">
                  Job Information
                </h2>

                <div className="space-y-4">

                  <p>
                    <span className="font-semibold">
                      Job ID :
                    </span>{" "}
                    {singleJob?.jobId || "Not available"}
                  </p>

                  <p>
                    <span className="font-semibold">
                      Role :
                    </span>{" "}
                    {singleJob?.title}
                  </p>

                  <p>
                    <span className="font-semibold">
                      Location :
                    </span>{" "}
                    {singleJob?.locations?.join(", ") || singleJob?.location}
                  </p>

                  <p>
                    <span className="font-semibold">
                      Experience :
                    </span>{" "}
                    {singleJob?.experienceLevel ?? 0} Years
                  </p>

                  <p>
                    <span className="font-semibold">
                      Salary :
                    </span>{" "}
                    {singleJob?.salaryMin !== undefined && singleJob?.salaryMax !== undefined
                      ? `₹${singleJob.salaryMin}-${singleJob.salaryMax} ${singleJob.salaryUnit || "LPA"}`
                      : `${singleJob?.salary} ${singleJob?.salaryUnit || "LPA"}`}
                  </p>
                  <p>
                    <span className="font-semibold">Work Mode :</span>{" "}
                    {singleJob?.workMode || "On-site"}
                  </p>
                  {singleJob?.qualification && (
                    <p>
                      <span className="font-semibold">Qualification :</span>{" "}
                      {singleJob.qualification}
                    </p>
                  )}

                </div>

              </div>

              <div className="bg-white border border-purple-100 rounded-2xl p-6 shadow-sm">

                <h2 className="font-bold text-xl mb-5">
                  Additional Details
                </h2>

                <div className="space-y-4">

                  <p>
                    <span className="font-semibold">
                      Job Type :
                    </span>{" "}
                    {singleJob?.jobType}
                  </p>

                  <p>
                    <span className="font-semibold">
                      Total Applicants :
                    </span>{" "}
                    {singleJob?.applications?.length || 0}
                  </p>

                  <p>
                    <span className="font-semibold">
                      Posted On :
                    </span>{" "}
                    {singleJob?.createdAt?.split("T")[0]}
                  </p>
                  {singleJob?.applicationDeadline && (
                    <p>
                      <span className="font-semibold">Apply By :</span>{" "}
                      {new Date(singleJob.applicationDeadline).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                  )}

                </div>

                {singleJob?.responsibilities?.length > 0 && (
                  <section className="mt-8 rounded-2xl border border-purple-100 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-xl font-bold">Responsibilities</h2>
                    <ul className="list-disc space-y-2 pl-5 text-gray-700">
                      {singleJob.responsibilities.map((responsibility, index) => (
                        <li key={`${index}-${responsibility}`}>{responsibility}</li>
                      ))}
                    </ul>
                  </section>
                )}

              </div>

            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default JobDescription;