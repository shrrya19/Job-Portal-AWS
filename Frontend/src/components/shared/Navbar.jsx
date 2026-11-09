import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { setUser } from "@/redux/authSlice";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  LogOut,
  User2,
  Briefcase,
  Menu,
  FileText,
  Sparkles,
  Video,
  X,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { USER_API_ENDPOINT } from "@/utils/constant";
import { toast } from "sonner";
import Logo from "../../assets/Logo_Org.png"

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useSelector((store) => store.auth) || {};
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  const logoutHandler = async () => {
    try {
      const res = await axios.post(
        `${USER_API_ENDPOINT}/logout`,
        {},
        {
          withCredentials: true,
        }
      );

      if (res.data.success) {
        localStorage.removeItem("token");
        dispatch(setUser(null));
        navigate("/");
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.message ||
        "Logout failed"
      );
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-purple-100 shadow-sm">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between h-[72px]">

          {/* LOGO */}

          <Link to="/" className="flex items-center gap-2">
            {/* <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#6A38C2] to-[#8B5CF6] flex items-center justify-center text-white font-bold shadow-md">
              HN
            </div> */}

            <div className="h-12 w-12 shrink-0">
              <img src={Logo} alt="Career Nest" className="h-full w-full object-contain" />
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-[#172554] sm:text-3xl">
              Career <span className="text-violet-700">Nest</span>
            </h1>
          </Link>

          {/* NAVIGATION */}

          <div className="flex items-center gap-4 lg:gap-6">
            <ul className={`hidden items-center gap-4 font-medium text-gray-700 xl:gap-5 ${isHomePage ? "xl:flex" : "lg:flex"}`}>

              {isHomePage && user?.role !== "recruiter" ? (
                <>
                  <li><a href="#home-top" className="transition hover:text-violet-700">Home</a></li>
                  <li><Link to="/jobs" className="transition hover:text-violet-700">Find Jobs</Link></li>
                  <li><a href="#top-hiring-companies" className="transition hover:text-violet-700">Companies</a></li>
                  <li><Link to="/internships" className="transition hover:text-violet-700">Internships</Link></li>
                  <li><a href="#why-hire-nest" className="transition hover:text-violet-700">About Us</a></li>
                  <li><a href="#footer" className="transition hover:text-violet-700">Contact Us</a></li>
                </>
              ) : user && user.role === "recruiter" ? (
                <>
                  <li>
                    <Link
                      to="/admin/companies"
                      className={`transition-all duration-200 hover:text-[#6A38C2] ${isActive("/admin/companies")
                          ? "text-[#6A38C2] font-semibold"
                          : ""
                        }`}
                    >
                      Companies
                    </Link>
                  </li>

                  <li>
                    <Link
                      to="/admin/jobs"
                      className={`transition-all duration-200 hover:text-[#6A38C2] ${isActive("/admin/jobs")
                          ? "text-[#6A38C2] font-semibold"
                          : ""
                        }`}
                    >
                      Jobs
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/" className={`transition-all duration-200 hover:text-[#6A38C2] ${isActive("/") ? "text-[#6A38C2] font-semibold" : ""}`}>
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link to="/jobs" className={`transition-all duration-200 hover:text-[#6A38C2] ${isActive("/jobs") ? "text-[#6A38C2] font-semibold" : ""}`}>
                      Jobs
                    </Link>
                  </li>
                  <li>
                    <Link to="/browse" className={`transition-all duration-200 hover:text-[#6A38C2] ${isActive("/browse") ? "text-[#6A38C2] font-semibold" : ""}`}>
                      Browse
                    </Link>
                  </li>
                  <li>
                    <Link to="/savedjobs" className={`transition-all duration-200 hover:text-[#6A38C2] ${isActive("/savedjobs") ? "text-[#6A38C2] font-semibold" : ""}`}>
                      Saved Jobs
                    </Link>
                  </li>
                  <li>
                    <Link to="/events" className={`transition-all duration-200 hover:text-[#6A38C2] ${isActive("/events") ? "text-[#6A38C2] font-semibold" : ""}`}>
                      Events
                    </Link>
                  </li>
                  <li>
                    <Link to="/ats-resume" className={`flex items-center gap-1.5 transition-all duration-200 hover:text-[#6A38C2] ${isActive("/ats-resume") ? "text-[#6A38C2] font-semibold" : ""}`}>
                      <Sparkles size={16} className="text-[#6A38C2]" />
                      <span>ATS Resume</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/internships" className={`flex items-center gap-1.5 transition-all duration-200 hover:text-[#6A38C2] ${isActive("/internships") ? "text-[#6A38C2] font-semibold" : ""}`}>
                      <Briefcase size={16} className="text-[#6A38C2]" />
                      <span>Internships</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/demo-interview" className={`flex items-center gap-1.5 transition-all duration-200 hover:text-[#6A38C2] ${isActive("/demo-interview") ? "text-[#6A38C2] font-semibold" : ""}`}>
                      <Video size={16} className="text-[#6A38C2]" />
                      <span>Demo Interview</span>
                    </Link>
                  </li>
                </>
              )}
            </ul>

            <button
              type="button"
              aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((open) => !open)}
              className={`rounded-lg p-2 text-gray-700 hover:bg-purple-50 ${isHomePage ? "xl:hidden" : "lg:hidden"}`}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* AUTH SECTION */}

            {!user ? (
              <div className={`hidden items-center gap-3 ${isHomePage ? "xl:flex" : "lg:flex"}`}>
                <Link to="/login">
                  <Button
                    variant="outline"
                    className="border-purple-200 hover:bg-purple-50 hover:text-[#6A38C2]"
                  >
                    Login
                  </Button>
                </Link>

                <Link to="/signup">
                  <Button className="bg-[#6A38C2] hover:bg-[#5B21B6] text-white shadow-md">
                    {isHomePage ? "Register" : "Signup"}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className={`hidden ${isHomePage ? "xl:block" : "lg:block"}`}>
              <Popover>
                <PopoverTrigger asChild>
                  <Avatar className="cursor-pointer border-2 border-purple-200 hover:border-[#6A38C2] transition-all">
                    <AvatarImage
                      src={user?.profile?.profilePhoto}
                      alt={user?.fullName}
                    />
                  </Avatar>
                </PopoverTrigger>

                <PopoverContent className="w-80 rounded-2xl border border-purple-100 shadow-xl">
                  <div className="space-y-4">

                    {/* USER INFO */}

                    <div className="flex gap-4 items-start">
                      <Avatar className="h-14 w-14 border border-purple-200">
                        <AvatarImage
                          src={user?.profile?.profilePhoto}
                          alt={user?.fullName}
                        />
                      </Avatar>

                      <div>
                        <h2 className="font-semibold text-lg">
                          {user?.fullName}
                        </h2>

                        <p className="text-sm text-gray-500">
                          {user?.profile?.bio ||
                            "Welcome to CareerNest"}
                        </p>
                      </div>
                    </div>

                    <div className="border-t pt-3 space-y-2">

                      {user?.role !== "recruiter" && (
                        <>
                          <Link
                            to="/profile"
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-purple-50 transition-all"
                          >
                            <User2 size={18} />
                            <span>View Profile</span>
                          </Link>

                          <Link
                            to="/ats-resume"
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-purple-50 transition-all"
                          >
                            <FileText size={18} className="text-[#6A38C2]" />
                            <span>ATS Resume Hub</span>
                          </Link>

                          <Link
                            to="/internships"
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-purple-50 transition-all"
                          >
                            <Briefcase size={18} className="text-[#6A38C2]" />
                            <span>Internships</span>
                          </Link>

                          <Link
                            to="/demo-interview"
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-purple-50 transition-all"
                          >
                            <Video size={18} className="text-[#6A38C2]" />
                            <span>Demo Interview Hub</span>
                          </Link>
                        </>
                      )}

                      <button
                        onClick={logoutHandler}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-red-50 text-red-500 transition-all w-full text-left"
                      >
                        <LogOut size={18} />
                        <span>Logout</span>
                      </button>

                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              </div>
            )}
          </div>
        </div>
        {mobileOpen && (
          <nav className="border-t border-purple-100 py-3 lg:hidden">
            <div className="flex flex-col gap-1">
          {isHomePage && user?.role !== "recruiter" ? (
            <>
              <a onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 hover:bg-purple-50" href="#home-top">Home</a>
              <Link onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 hover:bg-purple-50" to="/jobs">Find Jobs</Link>
              <a onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 hover:bg-purple-50" href="#top-hiring-companies">Companies</a>
              <Link onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 hover:bg-purple-50" to="/internships">Internships</Link>
              <a onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 hover:bg-purple-50" href="#why-hire-nest">About Us</a>
              <a onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 hover:bg-purple-50" href="#footer">Contact Us</a>
            </>
          ) : user?.role === "recruiter" ? (
                <>
                  <Link onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 hover:bg-purple-50" to="/admin/companies">Companies</Link>
                  <Link onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 hover:bg-purple-50" to="/admin/jobs">Jobs</Link>
                </>
              ) : (
                <>
                  <Link onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 hover:bg-purple-50" to="/">Home</Link>
                  <Link onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 hover:bg-purple-50" to="/jobs">Jobs</Link>
                  <Link onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 hover:bg-purple-50" to="/internships">Internships</Link>
                  <Link onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 hover:bg-purple-50" to="/browse">Browse</Link>
                  <Link onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 hover:bg-purple-50" to="/savedjobs">Saved Jobs</Link>
                  <Link onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 hover:bg-purple-50" to="/events">Events</Link>
                  <Link onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 hover:bg-purple-50" to="/ats-resume">ATS Resume</Link>
                  <Link onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 hover:bg-purple-50" to="/demo-interview">Demo Interview</Link>
                  {user && <Link onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 hover:bg-purple-50" to="/profile">Profile</Link>}
                </>
              )}
              {!user && (
                <div className="mt-2 flex gap-3 border-t border-purple-100 pt-3">
                  <Link onClick={() => setMobileOpen(false)} to="/login" className="flex-1 rounded-lg border border-purple-200 px-3 py-2 text-center">Login</Link>
                  <Link onClick={() => setMobileOpen(false)} to="/signup" className="flex-1 rounded-lg bg-[#6A38C2] px-3 py-2 text-center text-white">{isHomePage ? "Register" : "Sign up"}</Link>
                </div>
              )}
              {user && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    logoutHandler();
                  }}
                  className="mt-2 flex items-center gap-2 rounded-lg border-t border-red-100 px-3 py-3 text-left text-red-600"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

export default Navbar;