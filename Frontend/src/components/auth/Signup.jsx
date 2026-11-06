import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { USER_API_ENDPOINT } from "../../utils/constant";
import Navbar from "../shared/Navbar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "../../redux/authSlice";
import {
  Loader2,
  User,
  Mail,
  Phone,
  Lock,
  Upload,
  Briefcase,
} from "lucide-react";
import { motion } from "framer-motion";

const PASSWORD_REQUIREMENTS = /^[A-Z](?=.*\d)(?=.*[^A-Za-z0-9\s]).*$/;

const Signup = () => {
  const [input, setInput] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "student",
    file: "",
  });

  const { loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const changeEventHandler = (e) => {
    const { name, value } = e.target;
    if (name === "phoneNumber") {
      // Allow only digits, +, -, (, ), and spaces
      const sanitizedPhone = value.replace(/[^0-9+\-()\s]/g, "");
      setInput((prev) => ({
        ...prev,
        phoneNumber: sanitizedPhone,
      }));
      return;
    }

    setInput((prev) => ({
      ...prev,
      [name]: name === "email" ? value.trim().toLowerCase() : value,
    }));
  };

  const changeFileHandler = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file (PNG, JPG, WEBP, etc.)");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Profile photo size should not exceed 5MB.");
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

    if (!PASSWORD_REQUIREMENTS.test(input.password)) {
      toast.error(
        "Password must start with an uppercase letter and include at least one number and symbol."
      );
      return;
    }

    const digitsOnly = input.phoneNumber.replace(/\D/g, "");
    if (digitsOnly.length < 10) {
      toast.error("Phone number must contain at least 10 digits.");
      return;
    }
    if (digitsOnly.length > 15) {
      toast.error("Phone number cannot exceed 15 digits.");
      return;
    }

    const formData = new FormData();

    formData.append("fullName", input.fullName.trim());
    formData.append("email", input.email.trim());
    formData.append("phoneNumber", input.phoneNumber.trim());
    formData.append("password", input.password);
    formData.append("role", input.role);

    if (input.file) {
      formData.append("file", input.file);
    }

    try {
      dispatch(setLoading(true));

      const res = await axios.post(
        `${USER_API_ENDPOINT}/register`,
        formData,
        {
          withCredentials: true,
        }
      );

      if (res.data.success) {
        toast.success(res.data.message);
        navigate("/login");
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.message ||
          (error?.request
            ? "Cannot reach the server. Start the backend and check its database connection."
            : "Registration failed. Please try again.")
      );
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-white py-10">

        <div className="max-w-7xl mx-auto px-4">

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto"
          >

            <div className="bg-white rounded-3xl shadow-2xl border border-purple-100 overflow-hidden">

              {/* Top Banner */}

              <div className="h-2 bg-gradient-to-r from-[#6A38C2] via-violet-500 to-orange-500"></div>

              <div className="p-8">

                {/* Header */}

                <div className="text-center mb-8">

                  <div className="inline-flex items-center gap-2 bg-purple-100 text-[#6A38C2] px-4 py-2 rounded-full text-sm font-medium">
                    🚀 Create Your Account
                  </div>

                  <h1 className="text-4xl font-bold mt-5">
                    Join JobPortal
                  </h1>

                  <p className="text-gray-500 mt-2">
                    Start your journey and discover your dream job.
                  </p>

                </div>

                {/* Form */}

                <form onSubmit={submitHandler}>

                  {/* Full Name */}

                  <div className="mb-5">
                    <Label className="mb-2 block">
                      Full Name
                    </Label>

                    <div className="relative">

                      <User
                        size={18}
                        className="absolute left-3 top-3.5 text-gray-400"
                      />

                      <Input
                        type="text"
                        name="fullName"
                        value={input.fullName}
                        onChange={changeEventHandler}
                        placeholder="Enter your full name"
                        className="pl-10 h-12 rounded-xl"
                        required
                      />

                    </div>
                  </div>

                  {/* Email */}

                  <div className="mb-5">
                    <Label className="mb-2 block">
                      Email
                    </Label>

                    <div className="relative">

                      <Mail
                        size={18}
                        className="absolute left-3 top-3.5 text-gray-400"
                      />

                      <Input
                        type="email"
                        name="email"
                        value={input.email}
                        onChange={changeEventHandler}
                        placeholder="Enter your email"
                        className="pl-10 h-12 rounded-xl"
                        required
                      />

                    </div>
                  </div>

                  {/* Phone */}

                  <div className="mb-5">
                    <div className="flex justify-between items-center mb-2">
                      <Label>
                        Phone Number
                      </Label>
                      <span className="text-xs text-gray-400">10-15 digits</span>
                    </div>

                    <div className="relative">

                      <Phone
                        size={18}
                        className="absolute left-3 top-3.5 text-gray-400"
                      />

                      <Input
                        type="tel"
                        name="phoneNumber"
                        value={input.phoneNumber}
                        onChange={changeEventHandler}
                        placeholder="e.g. 9876543210 or +91 9876543210"
                        className="pl-10 h-12 rounded-xl"
                        required
                      />

                    </div>
                    {input.phoneNumber && input.phoneNumber.replace(/\D/g, "").length < 10 && (
                      <p className="text-xs text-amber-600 mt-1">
                        Must contain at least 10 digits ({input.phoneNumber.replace(/\D/g, "").length}/10 entered)
                      </p>
                    )}
                  </div>

                  {/* Password */}

                  <div className="mb-6">
                    <Label className="mb-2 block">
                      Password
                    </Label>

                    <div className="relative">

                      <Lock
                        size={18}
                        className="absolute left-3 top-3.5 text-gray-400"
                      />

                      <Input
                        type="password"
                        name="password"
                        value={input.password}
                        onChange={changeEventHandler}
                        placeholder="Start with a capital letter"
                        className="pl-10 h-12 rounded-xl"
                        autoComplete="new-password"
                        required
                      />

                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Start with an uppercase letter and include at least one number and symbol.
                    </p>
                  </div>

                  {/* Role Selection */}

                  <Label className="block mb-3">
                    Select Role
                  </Label>

                  <div className="grid grid-cols-2 gap-4 mb-6">

                    <div
                      onClick={() =>
                        setInput({
                          ...input,
                          role: "student",
                        })
                      }
                      className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                        input.role === "student"
                          ? "border-[#6A38C2] bg-purple-50"
                          : "border-gray-200"
                      }`}
                    >
                      <h3 className="font-semibold">
                        Student
                      </h3>

                      <p className="text-sm text-gray-500 mt-1">
                        Looking for jobs
                      </p>
                    </div>

                    <div
                      onClick={() =>
                        setInput({
                          ...input,
                          role: "recruiter",
                        })
                      }
                      className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                        input.role === "recruiter"
                          ? "border-[#6A38C2] bg-purple-50"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Briefcase size={16} />
                        <h3 className="font-semibold">
                          Recruiter
                        </h3>
                      </div>

                      <p className="text-sm text-gray-500 mt-1">
                        Hiring candidates
                      </p>
                    </div>

                  </div>

                  {/* File Upload */}

                  <div className="mb-6">

                    <Label className="block mb-2">
                      Profile Photo (Optional)
                    </Label>

                    <div className="border-2 border-dashed border-purple-200 rounded-2xl p-5 text-center bg-purple-50/20">

                      {input.file ? (
                        <div className="flex flex-col items-center gap-2">
                          <img
                            src={URL.createObjectURL(input.file)}
                            alt="Avatar preview"
                            className="w-20 h-20 rounded-full object-cover border-2 border-[#6A38C2] shadow-sm"
                          />
                          <p className="text-xs font-medium text-gray-700 truncate max-w-[220px]">
                            {input.file.name}
                          </p>
                          <button
                            type="button"
                            onClick={() => setInput((prev) => ({ ...prev, file: "" }))}
                            className="text-xs text-red-500 hover:underline cursor-pointer"
                          >
                            Remove photo
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload
                            className="mx-auto text-[#6A38C2]"
                            size={28}
                          />

                          <p className="text-sm text-gray-500 my-2">
                            Upload profile image (PNG, JPG, WEBP)
                          </p>
                        </>
                      )}

                      <Input
                        accept="image/*"
                        type="file"
                        onChange={changeFileHandler}
                        className="cursor-pointer mt-2"
                      />

                    </div>

                  </div>

                  {/* Button */}

                  {loading ? (
                    <Button
                      className="w-full h-12 rounded-xl bg-[#6A38C2]"
                      disabled
                    >
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Please Wait...
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      className="w-full h-12 rounded-xl bg-[#6A38C2] hover:bg-[#5B21B6]"
                    >
                      Sign Up
                    </Button>
                  )}

                  <div className="text-center mt-6">

                    <span className="text-gray-600">
                      Already have an account?
                    </span>

                    <Link
                      to="/login"
                      className="ml-2 text-[#6A38C2] font-semibold hover:underline"
                    >
                      Login
                    </Link>

                  </div>

                </form>

              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Signup;