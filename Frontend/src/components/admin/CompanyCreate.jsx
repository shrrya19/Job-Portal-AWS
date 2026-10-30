import React, { useState } from "react";
import Navbar from "../shared/Navbar";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { COMPANY_API_ENDPOINT } from "@/utils/constant";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { setSingleCompany } from "@/redux/companySlice";
import { Building2, ArrowLeft, PlusCircle } from "lucide-react";
import { motion } from "framer-motion";

const CompanyCreate = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [companyName, setCompanyName] = useState("");

  const registerNewCompany = async () => {
    try {
      const res = await axios.post(
        `${COMPANY_API_ENDPOINT}/register`,
        { name: companyName },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (res?.data?.success) {
        dispatch(setSingleCompany(res.data.company));

        toast.success(res.data.message);

        const companyId = res?.data?.company?._id;

        navigate(`/admin/companies/${companyId}`);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to create company");
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-white">

        <div className="max-w-4xl mx-auto px-4 py-10">

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl border border-purple-100 overflow-hidden"
          >

            <div className="h-2 bg-gradient-to-r from-[#6A38C2] via-violet-500 to-orange-500"></div>

            <div className="p-8">

              <div className="flex items-center gap-3 mb-6">

                <div className="bg-purple-100 p-3 rounded-xl">
                  <Building2
                    className="text-[#6A38C2]"
                    size={24}
                  />
                </div>

                <div>
                  <h1 className="text-3xl font-bold">
                    Create Company
                  </h1>

                  <p className="text-gray-500">
                    Add a company before posting jobs.
                  </p>
                </div>

              </div>

              <div className="bg-purple-50 border border-purple-100 rounded-2xl p-5 mb-6">

                <h2 className="font-semibold mb-2">
                  Why create a company?
                </h2>

                <p className="text-gray-600 text-sm">
                  Companies help organize jobs,
                  applications and branding for recruiters.
                </p>

              </div>

              <div>

                <Label className="mb-2 block font-medium">
                  Company Name
                </Label>

                <Input
                  type="text"
                  placeholder="Google, Microsoft, Netflix..."
                  value={companyName}
                  onChange={(e) =>
                    setCompanyName(e.target.value)
                  }
                  className="h-12 rounded-xl"
                />

              </div>

              <div className="flex gap-4 mt-8">

                <Button
                  variant="outline"
                  onClick={() =>
                    navigate("/admin/companies")
                  }
                  className="rounded-xl"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Cancel
                </Button>

                <Button
                  onClick={registerNewCompany}
                  className="bg-[#6A38C2] hover:bg-[#5B21B6] rounded-xl"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Continue
                </Button>

              </div>

            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default CompanyCreate;