import React, { useEffect, useState } from "react";
import Navbar from "../shared/Navbar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { CalendarDays, Search, Plus } from "lucide-react";
import { motion } from "framer-motion";

import AdminEventsTable from "./AdminEventsTable";
import useGetAllAdminEvents from "@/hooks/useGetAllAdminEvents";
import { setSearchEventByText } from "@/redux/eventSlice";

const AdminEvents = () => {
  useGetAllAdminEvents();

  const [input, setInput] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { allAdminEvents } = useSelector((store) => store.event);

  useEffect(() => {
    dispatch(setSearchEventByText(input));
  }, [input, dispatch]);

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-white">

        <div className="max-w-6xl mx-auto px-4 py-8">

          {/* Hero */}

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
                  Manage Tech Events
                </h1>

                <p className="text-gray-500 mt-2">
                  Create, update and manage all your tech events.
                </p>

              </div>

              <div className="bg-purple-50 border border-purple-100 rounded-2xl px-8 py-5 text-center">

                <CalendarDays
                  size={30}
                  className="mx-auto text-[#6A38C2]"
                />

                <h2 className="text-3xl font-bold mt-2">
                  {allAdminEvents?.length || 0}
                </h2>

                <p className="text-gray-500 text-sm">
                  Total Events
                </p>

              </div>

            </div>

          </motion.div>

          {/* Search */}

          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">

            <div className="relative w-full md:w-[350px]">

              <Search
                size={18}
                className="absolute left-3 top-3 text-gray-400"
              />

              <Input
                value={input}
                placeholder="Search event..."
                onChange={(e) => setInput(e.target.value)}
                className="pl-10 h-12 rounded-xl border-purple-100"
              />

            </div>

            <Button
              onClick={() => navigate("/admin/events/create")}
              className="bg-[#6A38C2] hover:bg-[#5B21B6] rounded-xl h-12 px-6"
            >
              <Plus className="mr-2 h-4 w-4" />

              Create Event

            </Button>

          </div>

          <AdminEventsTable />

        </div>

      </div>
    </>
  );
};

export default AdminEvents;