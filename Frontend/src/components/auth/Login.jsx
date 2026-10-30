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
import { setLoading, setUser } from "../../redux/authSlice";
import {
  Loader2,
  Mail,
  Lock,
  Briefcase,
} from "lucide-react";
import { motion } from "framer-motion";

const Login = () => {
  const [input, setInput] = useState({
    email: "",
    password: "",
    role: "student",
  });

  const { loading } = useSelector((state) => state.auth);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const changeEventHandler = (e) => {
    setInput({
      ...input,
      [e.target.name]: e.target.value,
    });
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      dispatch(setLoading(true));

      const res = await axios.post(
        `${USER_API_ENDPOINT}/login`,
        input,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        if (res.data.token) {
          localStorage.setItem("token", res.data.token);
        }
        dispatch(setUser(res.data.user));

        if (res.data.user.role === "recruiter") {
          navigate("/admin/companies");
        } else {
          navigate("/");
        }

        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);

      toast.error(
        error?.response?.data?.message ||
          "Login Failed"
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
            initial={{
              opacity: 0,
              y: 40,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
            }}
            className="max-w-2xl mx-auto"
          >

            <div className="bg-white rounded-3xl shadow-2xl border border-purple-100 overflow-hidden">

              {/* Top Gradient */}

              <div className="h-2 bg-gradient-to-r from-[#6A38C2] via-violet-500 to-orange-500"></div>

              <div className="p-8">

                {/* Header */}

                <div className="text-center mb-8">

                  <div className="inline-flex items-center gap-2 bg-purple-100 text-[#6A38C2] px-4 py-2 rounded-full text-sm font-medium">
                    🔐 Welcome Back
                  </div>

                  <h1 className="text-4xl font-bold mt-5">
                    Login
                  </h1>

                  <p className="text-gray-500 mt-2">
                    Access your account and continue your journey.
                  </p>

                </div>

                {/* Form */}

                <form onSubmit={submitHandler}>

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
                        placeholder="Enter your password"
                        className="pl-10 h-12 rounded-xl"
                        required
                      />

                    </div>

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
                        Apply for jobs
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
                        Hire candidates
                      </p>
                    </div>

                  </div>

                  {/* Login Button */}

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
                      Login
                    </Button>
                  )}

                  {/* Footer */}

                  <div className="text-center mt-6">

                    <span className="text-gray-600">
                      Don't have an account?
                    </span>

                    <Link
                      to="/signup"
                      className="ml-2 text-[#6A38C2] font-semibold hover:underline"
                    >
                      Sign Up
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

export default Login;