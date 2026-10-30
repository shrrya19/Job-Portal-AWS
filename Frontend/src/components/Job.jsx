import React from 'react'
import axios from "axios";
import { USER_API_ENDPOINT } from "@/utils/constant";
import { toast } from "sonner";
import { Button } from './ui/Button'
import { BookmarkIcon, MapPin, Briefcase, IndianRupee } from 'lucide-react'
import { Avatar } from './ui/Avatar'
import { AvatarImage } from './ui/Avatar'
import { Badge } from './ui/Badge'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const Job = ({ job }) => {
    const navigate = useNavigate();

    const daysAgoFunction = (mongodbTime) => {
        const createdAt = new Date(mongodbTime);
        const currentTime = new Date();
        const timeDifference = currentTime - createdAt;
        return Math.floor(timeDifference / (1000 * 24 * 60 * 60));
    };

    const saveJobHandler = async () => {
        try {
            const res = await axios.post(
                `${USER_API_ENDPOINT}/savejob/${job?._id}`, {}, { withCredentials: true }
            );
            if (res.data.success) toast.success(res.data.message);
        } catch (error) {
            toast.error(error?.response?.data?.message || "Something went wrong");
        }
    };

    return (
        <motion.div
            whileHover={{ y: -10, scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="relative overflow-hidden rounded-2xl bg-white border border-purple-100 shadow-md hover:shadow-2xl hover:border-purple-300 transition-all duration-300 p-5 group"
        >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-r from-purple-500/5 via-transparent to-orange-500/5"></div>
            <div className="flex items-center justify-between relative z-10">
                <p className="text-sm text-gray-500 font-medium">
                    {daysAgoFunction(job?.createdAt) === 0 ? "Posted Today" : `${daysAgoFunction(job?.createdAt)} Days Ago`}
                </p>
                <Button onClick={saveJobHandler} variant="outline" size="icon" className="rounded-full hover:bg-purple-100 hover:border-purple-400 transition-all">
                    <BookmarkIcon className="w-4 h-4" />
                </Button>
            </div>
            <div className="flex items-center gap-4 my-5 relative z-10">
                <Avatar className="h-14 w-14 border border-gray-200">
                    <AvatarImage src={job?.company?.logo} />
                </Avatar>
                <div>
                    <h1 className="font-bold text-lg text-gray-900">{job?.company?.name}</h1>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span>{job?.location || "India"}</span>
                    </div>
                </div>
            </div>
            <div className="relative z-10">
                <h1 className="font-bold text-xl text-gray-900 mb-2">{job?.title}</h1>
                <p className="text-sm text-gray-600 line-clamp-2">{job?.description}</p>
            </div>
            <div className="flex flex-wrap gap-2 mt-5 relative z-10">
                <Badge className="bg-blue-50 text-blue-700 border border-blue-200">{job?.position} Positions</Badge>
                <Badge className="bg-orange-50 text-orange-600 border border-orange-200">{job?.jobType}</Badge>
                <Badge className="bg-purple-50 text-purple-700 border border-purple-200">₹ {job?.salary} LPA</Badge>
            </div>
            <div className="flex items-center justify-between mt-5 relative z-10">
                <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Briefcase className="w-4 h-4" />
                    <span>{job?.experience || 0}+ Years</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-green-600 font-semibold">
                    <IndianRupee className="w-4 h-4" />
                    Hiring Now
                </div>
            </div>
            <div className="flex gap-3 mt-5 relative z-10">
                <Button onClick={() => navigate(`/description/${job?._id}`)} variant="outline" className="flex-1 rounded-xl border-purple-200 hover:bg-purple-50 hover:border-purple-400">
                    View Details
                </Button>
                <Button onClick={saveJobHandler} className="flex-1 rounded-xl bg-gradient-to-r from-[#6A38C2] to-[#7E22CE] hover:from-[#5B21B6] hover:to-[#6D28D9] text-white">
                    Save Job
                </Button>
            </div>
        </motion.div>
    )
}

export default Job
