import { useEffect } from "react";
import Navbar from "../shared/Navbar";
import ApplicantsTable from "./ApplicantsTable";
import axios from "axios";
import { APPLICANT_API_ENDPOINT } from "@/utils/constant";
import { useParams } from "react-router-dom";
import { setAllApplication } from "@/redux/applicationSlice";
import { useDispatch, useSelector } from "react-redux";
import { Users } from "lucide-react";
import { motion } from "framer-motion";

const Applicants = () => {
  const params = useParams();
  const dispatch = useDispatch();

  const { applicants } = useSelector(
    (store) => store.application
  );

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

      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-white">

        <div className="max-w-7xl mx-auto px-4 py-8">

          {/* Hero Section */}

          <motion.div
            initial={{ opacity: 0, y: -25 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl border border-purple-100 p-8 mb-8"
          >
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">

              <div>
                <span className="bg-purple-100 text-[#6A38C2] px-4 py-2 rounded-full text-sm font-medium">
                  Recruiter Dashboard
                </span>

                <h1 className="text-4xl font-bold mt-4">
                  Job Applicants
                </h1>

                <p className="text-gray-500 mt-2">
                  Review and manage all candidates.
                </p>
              </div>

              <div className="bg-purple-50 border border-purple-100 rounded-2xl px-8 py-5 text-center">

                <Users
                  size={30}
                  className="mx-auto text-[#6A38C2]"
                />

                <h2 className="text-3xl font-bold mt-2">
                  {applicants?.applications?.length || 0}
                </h2>

                <p className="text-gray-500 text-sm">
                  Total Applicants
                </p>

              </div>

            </div>
          </motion.div>

          <ApplicantsTable />

        </div>
      </div>
    </>
  );
};

export default Applicants;