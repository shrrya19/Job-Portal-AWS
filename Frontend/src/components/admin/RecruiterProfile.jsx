import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, Camera, Loader2, Mail, Phone, UserRound } from "lucide-react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "../shared/Navbar";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { setUser } from "@/redux/authSlice";
import { USER_API_ENDPOINT } from "@/utils/constant";

const getInitials = (name = "") =>
  name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join("") || "R";

const RecruiterProfile = () => {
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [input, setInput] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    bio: user?.profile?.bio || "",
  });

  const changeHandler = (event) => {
    const { name, value } = event.target;
    setInput((current) => ({ ...current, [name]: value }));
  };

  const photoChangeHandler = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file for your profile photo.");
      event.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Profile photo must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }
    setPhoto(file);
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    const digitsOnly = input.phoneNumber.replace(/\D/g, "");
    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      toast.error("Phone number must contain 10-15 digits.");
      return;
    }

    const formData = new FormData();
    formData.append("fullName", input.fullName.trim());
    formData.append("email", input.email.trim().toLowerCase());
    formData.append("phoneNumber", input.phoneNumber.trim());
    formData.append("bio", input.bio.trim());
    if (photo) formData.append("file", photo);

    try {
      setLoading(true);
      const response = await axios.post(`${USER_API_ENDPOINT}/profile/update`, formData, {
        withCredentials: true,
      });
      if (response.data.success) {
        dispatch(setUser(response.data.user));
        setPhoto(null);
        toast.success(response.data.message || "Profile updated successfully.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not update your profile.");
    } finally {
      setLoading(false);
    }
  };

  const currentPhoto = user?.profile?.profilePhoto;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-3xl">
          <Link
            to="/admin/dashboard"
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-violet-700"
          >
            <ArrowLeft size={16} />
            Back to dashboard
          </Link>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-gradient-to-r from-violet-50 to-white px-6 py-7 sm:px-8">
              <p className="text-sm font-semibold text-violet-700">Recruiter account</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900">My profile</h1>
              <p className="mt-2 text-sm text-slate-600">
                Keep your personal and contact information up to date.
              </p>
            </div>

            <form onSubmit={submitHandler} className="space-y-7 p-6 sm:p-8">
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <Avatar className="h-20 w-20 border-2 border-violet-100">
                  <AvatarImage src={currentPhoto} alt={`${user?.fullName || "Recruiter"} profile`} />
                  <AvatarFallback>{getInitials(user?.fullName)}</AvatarFallback>
                </Avatar>
                <div>
                  <Label htmlFor="recruiter-photo" className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    <Camera size={16} />
                    Change profile photo
                  </Label>
                  <Input
                    id="recruiter-photo"
                    type="file"
                    accept="image/*"
                    onChange={photoChangeHandler}
                    className="sr-only"
                  />
                  <p className="mt-2 text-xs text-slate-500">PNG, JPG, or another image format, up to 5 MB.</p>
                  {photo && <p className="mt-1 max-w-xs truncate text-xs text-violet-700">{photo.name}</p>}
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="recruiter-name">Full name <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="recruiter-name"
                      name="fullName"
                      value={input.fullName}
                      onChange={changeHandler}
                      className="h-10 pl-10"
                      maxLength={120}
                      autoComplete="name"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recruiter-email">Email address <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="recruiter-email"
                      name="email"
                      type="email"
                      value={input.email}
                      onChange={changeHandler}
                      className="h-10 pl-10"
                      maxLength={254}
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="recruiter-phone">Phone number <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="recruiter-phone"
                      name="phoneNumber"
                      type="tel"
                      value={input.phoneNumber}
                      onChange={changeHandler}
                      className="h-10 pl-10"
                      autoComplete="tel"
                      required
                    />
                  </div>
                  <p className="text-xs text-slate-500">Enter 10-15 digits; spaces and country-code formatting are allowed.</p>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="recruiter-bio">About me</Label>
                  <textarea
                    id="recruiter-bio"
                    name="bio"
                    value={input.bio}
                    onChange={changeHandler}
                    maxLength={500}
                    rows={4}
                    placeholder="Share a short introduction about your recruiting role."
                    className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  />
                  <p className="text-right text-xs text-slate-500">{input.bio.length}/500</p>
                </div>
              </div>

              <div className="flex justify-end border-t border-slate-100 pt-5">
                <Button type="submit" disabled={loading} className="min-w-36 bg-violet-700 text-white hover:bg-violet-800">
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save changes"}
                </Button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </>
  );
};

export default RecruiterProfile;
