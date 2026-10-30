import React, { useEffect, useState } from "react";
import Navbar from "../shared/Navbar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import CompaniesTable from "./CompaniesTable";
import { useNavigate } from "react-router-dom";
import useGetAllCompanies from "@/hooks/useGetAllCompanies";
import { useDispatch, useSelector } from "react-redux";
import { setSearchCompanyByText } from "@/redux/companySlice";
import { Search, Building2, Plus } from "lucide-react";
import { motion } from "framer-motion";

const Companies = () => {
  useGetAllCompanies();

  const [input, setInput] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { companies } = useSelector((store) => store.company);

  useEffect(() => {
    dispatch(setSearchCompanyByText(input));
  }, [input, dispatch]);

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-white">

        <div className="max-w-6xl mx-auto px-4 py-8">

          {/* Hero Section */}

          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl border border-purple-100 p-8 mb-8"
          >
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">

              <div>
                <span className="bg-purple-100 text-[#6A38C2] px-4 py-2 rounded-full text-sm font-medium">
                  Recruiter Dashboard
                </span>

                <h1 className="text-4xl font-bold mt-4">
                  Manage Companies
                </h1>

                <p className="text-gray-500 mt-2">
                  Create, manage and organize your registered companies.
                </p>
              </div>

              <div className="bg-purple-50 border border-purple-100 rounded-2xl px-8 py-5 text-center">
                <Building2
                  className="mx-auto text-[#6A38C2]"
                  size={30}
                />
                <h2 className="text-3xl font-bold mt-2">
                  {companies?.length || 0}
                </h2>
                <p className="text-gray-500 text-sm">
                  Total Companies
                </p>
              </div>

            </div>
          </motion.div>

          {/* Search + Button */}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col md:flex-row justify-between gap-4 mb-6"
          >

            <div className="relative w-full md:w-[350px]">

              <Search
                className="absolute left-3 top-3 text-gray-400"
                size={18}
              />

              <Input
                value={input}
                placeholder="Search company by name..."
                onChange={(e) => setInput(e.target.value)}
                className="pl-10 h-12 rounded-xl border-purple-100"
              />

            </div>

            <Button
              onClick={() =>
                navigate("/admin/companies/create")
              }
              className="bg-[#6A38C2] hover:bg-[#5B21B6] rounded-xl h-12 px-6"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Company
            </Button>

          </motion.div>

          {/* Table */}

          <CompaniesTable />

        </div>
      </div>
    </>
  );
};

export default Companies;