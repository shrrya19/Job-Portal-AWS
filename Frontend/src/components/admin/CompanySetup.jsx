import React, { useEffect, useState } from "react";
import Navbar from "../shared/Navbar";
import { Button } from "../ui/button";
import { ArrowLeft, Loader2, Building2, Globe, MapPin, Upload } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { COMPANY_API_ENDPOINT } from "@/utils/constant";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { setSingleCompany } from "@/redux/companySlice";
import axios from "axios";
import useGetCompanyById from "@/hooks/useGetCompanyById";
import { motion } from "framer-motion";

const CompanySetup = () => {
  const params = useParams();
  const dispatch = useDispatch();

  useGetCompanyById(params.id);

  const [input, setInput] = useState({
    name: "",
    description: "",
    website: "",
    location: "",
    file: null,
  });

  const { singleCompany } = useSelector(
    (store) => store.company
  );

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const changeEventHandler = (e) => {
    setInput({
      ...input,
      [e.target.name]: e.target.value,
    });
  };

  const changeFileHandler = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Company logo must be an image file (PNG, JPG, WEBP, SVG)");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Company logo size cannot exceed 5MB.");
        return;
      }
      setInput((prev) => ({
        ...prev,
        file,
      }));
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("name", input.name);
    formData.append("description", input.description);
    formData.append("website", input.website);
    formData.append("location", input.location);

    if (input.file) {
      formData.append("file", input.file);
    }

    try {
      setLoading(true);

      const res = await axios.put(
        `${COMPANY_API_ENDPOINT}/update/${params.id}`,
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        if (res.data.company) {
          dispatch(setSingleCompany(res.data.company));
        }
        toast.success(res.data.message);
        navigate("/admin/companies");
      }
    } catch (error) {
      console.log(error);

      toast.error(
        error?.response?.data?.message ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (singleCompany) {
      setInput({
        name: singleCompany.name || "",
        description:
          singleCompany.description || "",
        website:
          singleCompany.website || "",
        location:
          singleCompany.location || "",
        file: null,
      });
    }
  }, [singleCompany]);

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-white">

        <div className="max-w-5xl mx-auto px-4 py-10">

          <motion.div
            initial={{
              opacity: 0,
              y: 30,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.4,
            }}
            className="bg-white rounded-3xl shadow-xl border border-purple-100 overflow-hidden"
          >

            {/* Top Banner */}

            <div className="h-2 bg-gradient-to-r from-[#6A38C2] via-violet-500 to-orange-500"></div>

            <div className="p-8">

              {/* Header */}

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

                <div className="flex items-center gap-4">

                  <div className="bg-purple-100 p-4 rounded-2xl">
                    <Building2
                      className="text-[#6A38C2]"
                      size={28}
                    />
                  </div>

                  <div>
                    <h1 className="text-3xl font-bold">
                      Company Setup
                    </h1>

                    <p className="text-gray-500 mt-1">
                      Manage company profile
                      and branding.
                    </p>
                  </div>

                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    navigate("/admin/companies")
                  }
                  className="rounded-xl"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>

              </div>

              {/* Logo Preview */}

              <div className="bg-purple-50 border border-purple-100 rounded-2xl p-6 mb-8">

                <div className="flex items-center gap-5">

                  <div className="h-20 w-20 rounded-2xl bg-white shadow flex items-center justify-center overflow-hidden">

                    {singleCompany?.logo ? (
                      <img
                        src={singleCompany.logo}
                        alt="logo"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Building2
                        size={36}
                        className="text-[#6A38C2]"
                      />
                    )}

                  </div>

                  <div>
                    <h2 className="font-bold text-xl">
                      {singleCompany?.name ||
                        "Company"}
                    </h2>

                    <p className="text-gray-500">
                      Update company details,
                      branding and logo.
                    </p>
                  </div>

                </div>

              </div>

              {/* Form */}

              <form
                onSubmit={submitHandler}
                className="space-y-6"
              >

                <div>
                  <Label className="mb-2 block">
                    Company Name
                  </Label>

                  <Input
                    type="text"
                    name="name"
                    value={input.name}
                    onChange={
                      changeEventHandler
                    }
                    className="h-12 rounded-xl"
                  />
                </div>

                <div>
                  <Label className="mb-2 block">
                    Description
                  </Label>

                  <Input
                    type="text"
                    name="description"
                    value={input.description}
                    onChange={
                      changeEventHandler
                    }
                    className="h-12 rounded-xl"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">

                  <div>
                    <Label className="mb-2 block">
                      Website
                    </Label>

                    <div className="relative">

                      <Globe
                        className="absolute left-3 top-3 text-gray-400"
                        size={18}
                      />

                      <Input
                        type="text"
                        name="website"
                        value={input.website}
                        onChange={
                          changeEventHandler
                        }
                        className="pl-10 h-12 rounded-xl"
                      />

                    </div>
                  </div>

                  <div>
                    <Label className="mb-2 block">
                      Location
                    </Label>

                    <div className="relative">

                      <MapPin
                        className="absolute left-3 top-3 text-gray-400"
                        size={18}
                      />

                      <Input
                        type="text"
                        name="location"
                        value={input.location}
                        onChange={
                          changeEventHandler
                        }
                        className="pl-10 h-12 rounded-xl"
                      />

                    </div>
                  </div>

                </div>

                {/* Logo Upload */}

                <div>

                  <Label className="mb-2 block">
                    Company Logo
                  </Label>

                  <div className="border-2 border-dashed border-purple-200 rounded-2xl p-6 text-center bg-purple-50/20">

                    {input.file ? (
                      <div className="flex flex-col items-center gap-2 mb-3">
                        <img
                          src={URL.createObjectURL(input.file)}
                          alt="New Company Logo Preview"
                          className="w-20 h-20 rounded-2xl object-cover border-2 border-[#6A38C2] shadow-sm"
                        />
                        <p className="text-xs font-medium text-gray-700 truncate max-w-[220px]">
                          {input.file.name}
                        </p>
                        <button
                          type="button"
                          onClick={() => setInput((prev) => ({ ...prev, file: null }))}
                          className="text-xs text-red-500 hover:underline cursor-pointer"
                        >
                          Remove selected logo
                        </button>
                      </div>
                    ) : singleCompany?.logo ? (
                      <div className="flex flex-col items-center gap-2 mb-3">
                        <img
                          src={singleCompany.logo}
                          alt="Current Company Logo"
                          className="w-20 h-20 rounded-2xl object-cover border border-purple-200 shadow-sm"
                        />
                        <p className="text-xs text-gray-500">
                          Current Company Logo
                        </p>
                      </div>
                    ) : (
                      <>
                        <Upload
                          className="mx-auto text-[#6A38C2]"
                          size={32}
                        />

                        <p className="text-gray-500 my-3">
                          Upload company logo (PNG, JPG, WEBP, SVG)
                        </p>
                      </>
                    )}

                    <Input
                      type="file"
                      accept="image/*"
                      onChange={
                        changeFileHandler
                      }
                      className="cursor-pointer max-w-sm mx-auto"
                    />

                  </div>

                </div>

                {/* Button */}

                {loading ? (
                  <Button
                    disabled
                    className="w-full h-12 bg-[#6A38C2]"
                  >
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please Wait...
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="w-full h-12 bg-[#6A38C2] hover:bg-[#5B21B6] rounded-xl"
                  >
                    Update Company
                  </Button>
                )}

              </form>

            </div>

          </motion.div>

        </div>
      </div>
    </>
  );
};

export default CompanySetup;