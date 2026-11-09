import { useEffect, useState } from "react";
import Navbar from "../shared/Navbar";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useSelector } from "react-redux";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import axios from "axios";
import { JOB_API_ENDPOINT } from "@/utils/constant";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, BriefcaseBusiness, Sparkles, X } from "lucide-react";
import { motion } from "framer-motion";
import useGetAllCompanies from "@/hooks/useGetAllCompanies";
import IndiaLocationDatalist from "../shared/IndiaLocationDatalist";

const initialInput = {
  title: "",
  jobId: "",
  description: "",
  requirements: "",
  salary: "",
  locations: [],
  country: "India",
  jobType: "Full-Time",
  experience: "",
  position: "1",
  companyId: "",
};

const PostJob = () => {
  useGetAllCompanies();
  const { id } = useParams();
  const [input, setInput] = useState(initialInput);
  const [loading, setLoading] = useState(false);
  const [loadingJob, setLoadingJob] = useState(Boolean(id));
  const [submitError, setSubmitError] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const navigate = useNavigate();
  const { companies = [] } = useSelector((store) => store.company);

  useEffect(() => {
    if (!id) return;

    const fetchJob = async () => {
      try {
        const res = await axios.get(`${JOB_API_ENDPOINT}/getadmin/${id}`, {
          withCredentials: true,
        });
        const job = res.data.job;
        if (!res.data.success || !job) {
          throw new Error("Unable to load this job.");
        }

        setInput({
          title: job.title || "",
          jobId: job.jobId || "",
          description: job.description || "",
          requirements: Array.isArray(job.requirements)
            ? job.requirements.join(", ")
            : "",
          salary: String(job.salary ?? ""),
          locations: Array.isArray(job.locations) && job.locations.length
            ? job.locations
            : job.location ? [job.location] : [],
          country: "India",
          jobType: job.jobType === "Full Time" ? "Full-Time" : job.jobType || "Full-Time",
          experience: String(job.experienceLevel ?? ""),
          position: String(job.position ?? 1),
          companyId: job.company?._id || job.company || "",
        });
      } catch (error) {
        toast.error(error?.response?.data?.message || error.message || "Unable to load this job.");
        navigate("/admin/jobs");
      } finally {
        setLoadingJob(false);
      }
    };

    fetchJob();
  }, [id, navigate]);

  const changeEventHandler = (event) => {
    setSubmitError("");
    setInput((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const addLocation = (event) => {
    event.preventDefault();
    const newLocation = locationSearch.trim();
    if (!newLocation) return;

    const alreadySelected = input.locations.some(
      (location) => location.toLowerCase() === newLocation.toLowerCase()
    );
    if (alreadySelected) {
      setSubmitError("That location is already selected.");
      return;
    }
    if (newLocation.toLowerCase() === "remote" && input.locations.length) {
      setSubmitError("Remote must be selected by itself.");
      return;
    }
    if (input.locations.some((location) => location.toLowerCase() === "remote")) {
      setSubmitError("Remove Remote before adding another location.");
      return;
    }

    setInput((current) => ({ ...current, locations: [...current.locations, newLocation] }));
    setLocationSearch("");
    setSubmitError("");
  };

  const removeLocation = (locationToRemove) => {
    setInput((current) => ({
      ...current,
      locations: current.locations.filter((location) => location !== locationToRemove),
    }));
    setSubmitError("");
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    setSubmitError("");
    if (!input.locations.length) {
      setSubmitError("Select at least one job location.");
      return;
    }
    setLoading(true);
    try {
      const endpoint = id
        ? `${JOB_API_ENDPOINT}/update/${id}`
        : `${JOB_API_ENDPOINT}/post`;
      const requestConfig = {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      };
      const payload = {
        ...input,
        location: input.locations[0],
      };
      const res = id
        ? await axios.put(endpoint, payload, requestConfig)
        : await axios.post(endpoint, payload, requestConfig);

      if (res.data.success) {
        toast.success(res.data.message);
        navigate("/admin/jobs");
      }
    } catch (error) {
      const message = error?.response?.data?.message || "Unable to save this job.";
      setSubmitError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-white">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex flex-col items-center justify-between gap-6 rounded-3xl border border-purple-100 bg-white p-8 shadow-xl md:flex-row"
          >
            <div>
              <span className="rounded-full bg-purple-100 px-4 py-2 text-sm font-medium text-[#6A38C2]">
                Recruiter Dashboard
              </span>
              <h1 className="mt-4 text-4xl font-bold">{id ? "Edit Job" : "Post New Job"}</h1>
              <p className="mt-2 text-gray-500">
                {id
                  ? "Update the role details and keep your opportunity current."
                  : "Create a clear opportunity and connect with qualified candidates."}
              </p>
            </div>
            <div className="rounded-2xl border border-purple-100 bg-purple-50 px-8 py-5 text-center">
              <BriefcaseBusiness size={30} className="mx-auto text-[#6A38C2]" />
              <h2 className="mt-2 text-3xl font-bold">{companies.length}</h2>
              <p className="text-sm text-gray-500">Registered Companies</p>
            </div>
          </motion.header>

          {loadingJob ? (
            <div className="rounded-3xl border border-purple-100 bg-white p-12 text-center text-gray-500">
              <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin text-[#6A38C2]" />
              Loading job details...
            </div>
          ) : (
            <motion.form
              onSubmit={submitHandler}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-purple-100 bg-white p-8 shadow-xl"
            >
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <Label htmlFor="title">Job Title</Label>
                  <Input id="title" name="title" required value={input.title} onChange={changeEventHandler} placeholder="Frontend Developer" className="mt-2 h-12 rounded-xl" />
                </div>
                <div>
                  <Label htmlFor="jobId">Job ID</Label>
                  <Input id="jobId" name="jobId" required value={input.jobId} onChange={changeEventHandler} placeholder="ABC-JOB-101" pattern="[A-Za-z0-9](?:[A-Za-z0-9_]|-){2,49}" maxLength={50} title="Use 3-50 letters, numbers, hyphens, or underscores." className="mt-2 h-12 rounded-xl" />
                </div>
                <div>
                  <Label htmlFor="location-search">Job Locations</Label>
                  <div className="mt-2 flex gap-2">
                    <Input
                      id="location-search"
                      list="post-job-india-locations"
                      value={locationSearch}
                      onChange={(event) => setLocationSearch(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") addLocation(event);
                      }}
                      placeholder="Choose an Indian city or Remote"
                      className="h-12 rounded-xl"
                    />
                    <Button type="button" variant="outline" onClick={addLocation} className="h-12 rounded-xl">
                      Add
                    </Button>
                  </div>
                  <IndiaLocationDatalist id="post-job-india-locations" />
                  <div className="mt-3 flex flex-wrap gap-2">
                    {input.locations.map((location) => (
                      <span key={location} className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1.5 text-sm font-medium text-purple-800">
                        {location}
                        <button
                          type="button"
                          aria-label={`Remove ${location}`}
                          onClick={() => removeLocation(location)}
                          className="rounded-full hover:text-red-700"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <textarea id="description" name="description" required value={input.description} onChange={changeEventHandler} placeholder="Describe the role and responsibilities." className="mt-2 min-h-28 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                </div>
                <div>
                  <Label htmlFor="requirements">Requirements</Label>
                  <textarea id="requirements" name="requirements" required value={input.requirements} onChange={changeEventHandler} placeholder="React, Node.js, communication" className="mt-2 min-h-28 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                </div>
                <div>
                  <Label htmlFor="salary">Salary (LPA)</Label>
                  <Input id="salary" name="salary" type="number" min="0" required value={input.salary} onChange={changeEventHandler} placeholder="12" className="mt-2 h-12 rounded-xl" />
                </div>
                <div>
                  <Label>Job Type</Label>
                  <Select value={input.jobType} onValueChange={(jobType) => {
                    setSubmitError("");
                    setInput((current) => ({ ...current, jobType }));
                  }}>
                    <SelectTrigger className="mt-2 h-12 w-full rounded-xl">
                      <SelectValue placeholder="Choose a job type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="Full-Time">Full Time</SelectItem>
                        <SelectItem value="Contract">Contract</SelectItem>
                        <SelectItem value="Internship">Internship</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="experience">Experience (years)</Label>
                  <Input id="experience" name="experience" type="number" min="0" required value={input.experience} onChange={changeEventHandler} placeholder="2" className="mt-2 h-12 rounded-xl" />
                </div>
                <div>
                  <Label htmlFor="position">Number of Positions</Label>
                  <Input id="position" name="position" type="number" min="1" required value={input.position} onChange={changeEventHandler} className="mt-2 h-12 rounded-xl" />
                </div>
              </div>

              {submitError && (
                <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {submitError}
                </div>
              )}

              <div className="mt-6">
                <Label className="mb-2 block">Select Company</Label>
                {companies.length ? (
                  <Select value={input.companyId} onValueChange={(companyId) => {
                    setSubmitError("");
                    setInput((current) => ({ ...current, companyId }));
                  }}>
                    <SelectTrigger className="h-12 w-full rounded-xl">
                      <SelectValue placeholder="Choose company" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {companies.map((company) => (
                          <SelectItem key={company._id} value={company._id}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 font-medium text-red-600">
                    Create a company before posting a job.
                  </div>
                )}
              </div>

              <Button type="submit" disabled={loading || loadingJob || !companies.length} className="mt-8 h-12 w-full rounded-xl bg-[#6A38C2] font-semibold text-white hover:bg-[#5B21B6]">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                {loading ? "Saving..." : id ? "Save Changes" : "Post New Job"}
              </Button>
            </motion.form>
          )}
        </div>
      </main>
    </>
  );
};

export default PostJob;
