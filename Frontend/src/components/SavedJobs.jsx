import React, { useEffect, useState } from "react";
import Navbar from "./shared/Navbar";
import Job from "./Job";
import axios from "axios";
import { USER_API_ENDPOINT } from "@/utils/constant";
import { motion } from "framer-motion";
import {
    BookmarkCheck,
    Sparkles,
    BriefcaseBusiness,
    TrendingUp,
} from "lucide-react";

const SavedJobs = () => {
    const [savedJobs, setSavedJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    const getSavedJobs = async () => {
        try {
            const res = await axios.get(
                `${USER_API_ENDPOINT}/savedjobs`,
                {
                    withCredentials: true,
                }
            );

            if (res.data.success) {
                setSavedJobs(res.data.savedJobs);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getSavedJobs();
    }, []);

    return (
        <>
            <Navbar />

            <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-white overflow-hidden">

                {/* Background Blur */}

                <div className="fixed top-24 left-10 w-72 h-72 bg-purple-300/20 blur-3xl rounded-full"></div>

                <div className="fixed bottom-10 right-10 w-72 h-72 bg-violet-300/20 blur-3xl rounded-full"></div>

                <div className="max-w-7xl mx-auto px-4 py-10 relative z-10">

                    {/* Hero */}

                    <motion.div
                        initial={{ opacity: 0, y: -80 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="bg-white border border-purple-100 rounded-3xl shadow-xl p-8 mb-10"
                    >
                        <div className="flex flex-col lg:flex-row justify-between items-center gap-8">

                            <div>

                                <div className="inline-flex items-center gap-2 bg-purple-100 text-[#6A38C2] px-4 py-2 rounded-full text-sm font-medium mb-4">

                                    <Sparkles size={16} />

                                    Saved Collection

                                </div>

                                <h1 className="text-4xl font-bold text-gray-900">
                                    Your Saved Jobs
                                </h1>

                                <p className="text-gray-500 mt-3">
                                    All your bookmarked opportunities are available here.
                                </p>

                            </div>

                            <div className="flex gap-4">

                                <div className="bg-purple-50 border border-purple-100 rounded-2xl px-6 py-4 text-center">

                                    <BriefcaseBusiness
                                        size={28}
                                        className="mx-auto text-[#6A38C2]"
                                    />

                                    <h2 className="font-bold text-2xl mt-2">
                                        {savedJobs.length}
                                    </h2>

                                    <p className="text-sm text-gray-500">
                                        Saved Jobs
                                    </p>

                                </div>

                                <div className="bg-green-50 border border-green-100 rounded-2xl px-6 py-4 text-center">

                                    <TrendingUp
                                        size={28}
                                        className="mx-auto text-green-600"
                                    />

                                    <h2 className="font-bold text-2xl mt-2">
                                        100%
                                    </h2>

                                    <p className="text-sm text-gray-500">
                                        Ready To Apply
                                    </p>

                                </div>

                            </div>

                        </div>
                    </motion.div>

                    {/* Heading */}

                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-8"
                    >

                        <h1 className="text-3xl font-bold text-gray-900">

                            Saved Jobs

                            <span className="text-[#6A38C2]">
                                {" "}
                                ({savedJobs.length})
                            </span>

                        </h1>

                        <div className="w-24 h-1 bg-[#6A38C2] rounded-full mt-3"></div>

                    </motion.div>

                    {loading ? (
                        <div className="text-center py-32">

                            <div className="w-14 h-14 border-4 border-purple-300 border-t-[#6A38C2] rounded-full animate-spin mx-auto"></div>

                            <p className="mt-5 text-gray-500">
                                Loading Saved Jobs...
                            </p>

                        </div>
                    ) : (
                        <>
                            {savedJobs.length > 0 ? (

                                <div className="grid xl:grid-cols-3 md:grid-cols-2 gap-6">

                                    {savedJobs.map((job, index) => (

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
                                                y: -10,
                                                scale: 1.02,
                                            }}
                                            className="relative"
                                        >

                                            {/* Glow */}

                                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-violet-500/10 rounded-3xl blur-xl opacity-0 hover:opacity-100 transition-all duration-500"></div>

                                            <div className="relative"> <Job job={job} /> </div>

                                        </motion.div>

                                    ))}

                                </div>

                            ) : (

                                <motion.div
                                    initial={{
                                        opacity: 0,
                                        scale: 0.9,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        scale: 1,
                                    }}
                                    className="bg-white rounded-3xl shadow-xl p-16 text-center"
                                >

                                    <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center mx-auto">

                                        <BookmarkCheck
                                            size={45}
                                            className="text-[#6A38C2]"
                                        />

                                    </div>

                                    <h2 className="text-3xl font-bold mt-8 text-gray-800">
                                        No Saved Jobs Yet
                                    </h2>

                                    <p className="text-gray-500 mt-3 max-w-md mx-auto">
                                        You haven't saved any jobs yet.
                                        Browse jobs and click on
                                        <span className="font-semibold text-[#6A38C2]">
                                            {" "}Save Job
                                        </span>
                                        {" "}to bookmark them here.
                                    </p>

                                </motion.div>

                            )}

                        </>
                    )}

                </div>

            </div>

        </>
    );
};

export default SavedJobs;