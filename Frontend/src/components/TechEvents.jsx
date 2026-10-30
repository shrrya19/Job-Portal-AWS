import React, { useEffect } from "react";
import Navbar from "./shared/Navbar";
import Job from "./Job";
import { useDispatch, useSelector } from "react-redux";
import { setSearchedQuery } from "@/redux/jobSlice";
import useGetAllJobs from "@/hooks/useGetAllJobs";
import { motion } from "framer-motion";
import { BriefcaseBusiness, Sparkles, TrendingUp } from "lucide-react";

const Browse = () => {
  useGetAllJobs();

  const { allJobs } = useSelector((store) => store.job);
  const dispatch = useDispatch();

  useEffect(() => {
    return () => {
      dispatch(setSearchedQuery(""));
    };
  }, [dispatch]);

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-white overflow-hidden">

        {/* Background Effects */}

        <div className="fixed top-20 left-10 w-72 h-72 bg-purple-300/20 blur-3xl rounded-full"></div>

        <div className="fixed bottom-20 right-10 w-72 h-72 bg-violet-300/20 blur-3xl rounded-full"></div>

        <div className="max-w-7xl mx-auto px-4 py-10 relative z-10">

          {/* Hero Section */}

          <motion.div
            initial={{ opacity: 0, y: -80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              ease: "easeOut",
            }}
            className="bg-white border border-purple-100 shadow-xl rounded-3xl p-8 mb-10"
          >
            <div className="flex flex-col lg:flex-row justify-between items-center gap-8">

              <div>
                <div className="inline-flex items-center gap-2 bg-purple-100 text-[#6A38C2] px-4 py-2 rounded-full text-sm font-medium mb-4">
                  <Sparkles size={16} />
                  Discover Opportunities
                </div>

                <h1 className="text-4xl font-bold text-gray-900">
                  Browse All Available Jobs
                </h1>

                <p className="text-gray-500 mt-3">
                  Find your next career opportunity from top companies.
                </p>
              </div>

              <div className="flex gap-4">

                <div className="bg-purple-50 border border-purple-100 rounded-2xl px-6 py-4 text-center">
                  <BriefcaseBusiness
                    className="mx-auto text-[#6A38C2]"
                    size={28}
                  />
                  <h2 className="font-bold text-2xl mt-2">
                    {allJobs.length}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Total Jobs
                  </p>
                </div>

                <div className="bg-orange-50 border border-orange-100 rounded-2xl px-6 py-4 text-center">
                  <TrendingUp
                    className="mx-auto text-orange-500"
                    size={28}
                  />
                  <h2 className="font-bold text-2xl mt-2">
                    100%
                  </h2>
                  <p className="text-sm text-gray-500">
                    Active Hiring
                  </p>
                </div>

              </div>
            </div>
          </motion.div>

          {/* Section Heading */}

          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900">
              Search Results
              <span className="text-[#6A38C2]">
                {" "}
                ({allJobs.length})
              </span>
            </h1>

            <div className="w-24 h-1 bg-[#6A38C2] rounded-full mt-3"></div>
          </motion.div>

          {/* Job Cards */}

          <div className="grid xl:grid-cols-3 md:grid-cols-2 gap-6">

            {allJobs.map((job, index) => (
              <motion.div
                key={job._id}
                initial={{
                  opacity: 0,
                  y: 80,
                  scale: 0.9,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.08,
                }}
                whileHover={{
                  y: -12,
                  scale: 1.03,
                }}
                className="relative"
              >
                {/* Glow Effect */}

                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-violet-500/10 rounded-3xl blur-xl opacity-0 hover:opacity-100 transition-all duration-500"></div>

                <div className="relative">
                  <Job job={job} />
                </div>
              </motion.div>
            ))}

          </div>

          {/* Empty State */}

          {allJobs.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-3xl shadow-lg p-16 text-center mt-10"
            >
              <h2 className="text-3xl font-bold text-gray-700">
                No Jobs Found 😔
              </h2>

              <p className="text-gray-500 mt-3">
                Please check back later.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default Browse;