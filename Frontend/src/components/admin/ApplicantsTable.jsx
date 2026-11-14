import { Fragment, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { APPLICANT_API_ENDPOINT } from "@/utils/constant";
import { toast } from "sonner";
import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  DollarSign,
  FileText,
  Link2,
  MapPin,
  Phone,
  Save,
  Search,
  StickyNote,
  Users,
} from "lucide-react";
import { updateApplicantStage } from "@/redux/applicationSlice";
import { Button } from "../ui/button";

const stages = [
  "applied",
  "shortlisted",
  "interview scheduled",
  "offer issued",
  "offer accepted",
  "rejected",
];
const stageLabel = (stage) => ({
  applied: "Applied",
  shortlisted: "Shortlisted",
  "interview scheduled": "Interview",
  "offer issued": "Offer Extended",
  "offer accepted": "Hired",
  rejected: "Declined",
}[stage] || stage.replace(/\b\w/g, (letter) => letter.toUpperCase()));

const normalizeStage = (status) => {
  const stage = String(status || "applied").trim().toLowerCase();
  if (["pending", "under review"].includes(stage)) return "applied";
  if (stage === "interview") return "interview scheduled";
  if (["offer extended", "offer issued"].includes(stage)) return "offer issued";
  if (["hired", "offer accepted", "selected", "accepted"].includes(stage)) return "offer accepted";
  if (["declined", "offer rejected", "interview not cleared", "rejected"].includes(stage)) return "rejected";
  return stages.includes(stage) ? stage : "applied";
};
const statusStyles = {
  applied: "bg-sky-50 text-sky-700 ring-sky-600/15",
  shortlisted: "bg-amber-50 text-amber-700 ring-amber-600/15",
  "interview scheduled": "bg-violet-50 text-violet-700 ring-violet-600/15",
  "offer issued": "bg-indigo-50 text-indigo-700 ring-indigo-600/15",
  "offer accepted": "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  rejected: "bg-rose-50 text-rose-700 ring-rose-600/15",
};
const dateInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
};
const timeInputValue = (value) => {
  if (typeof value !== "string") return "";
  if (/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return value;
  const legacyTime = value.match(/^(0?[1-9]|1[0-2]):([0-5]\d)\s?(AM|PM)$/i);
  if (!legacyTime) return "";
  let hour = Number(legacyTime[1]) % 12;
  if (legacyTime[3].toUpperCase() === "PM") hour += 12;
  return `${String(hour).padStart(2, "0")}:${legacyTime[2]}`;
};
const localDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const getTomorrow = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return localDateString(date);
};
const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime())
    ? ""
    : new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }).format(date);
};
const formatTime = (value) => {
  if (!value || !/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return "";
  const [hour, minute] = value.split(":").map(Number);
  const suffix = hour >= 12 ? "PM" : "AM";
  return `${String(hour % 12 || 12).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${suffix}`;
};
const formatOffer = (amount, currency, period) => {
  const formattedAmount = new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
  return `${formattedAmount} / ${period}`;
};
const currencyOptions = ["INR", "USD", "EUR", "GBP", "CAD", "AUD"];
const salaryPeriods = ["hourly", "monthly", "annually"];
const interviewModes = ["Online", "In-person", "Phone"];

const ApplicantsTable = () => {
  const dispatch = useDispatch();
  const [detailsByApplication, setDetailsByApplication] = useState({});
  const [notesByApplication, setNotesByApplication] = useState({});
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [expandedApplication, setExpandedApplication] = useState(null);
  const { applicants } = useSelector((store) => store.application);
  const applications = useMemo(() => applicants?.applications || [], [applicants?.applications]);
  const minInterviewDate = getTomorrow();

  const visibleApplications = useMemo(() => {
    const query = search.trim().toLowerCase();
    return applications.filter((item) => {
      const status = normalizeStage(item.status);
      const matchesStatus = statusFilter === "all" || status === statusFilter;
      const searchable = [
        item.applicant?.fullName,
        item.applicant?.email,
        item.applicant?.phoneNumber,
      ].filter(Boolean).join(" ").toLowerCase();
      return matchesStatus && (!query || searchable.includes(query));
    });
  }, [applications, search, statusFilter]);

  const getDetails = (item) => {
    const saved = item.stageDetails || {};
    const draft = detailsByApplication[item._id] || {};
    return {
      interviewDate: draft.interviewDate ?? dateInputValue(saved.interviewDate),
      interviewTime: draft.interviewTime ?? timeInputValue(saved.interviewTime),
      interviewMode: draft.interviewMode ?? saved.interviewMode ?? "",
      interviewLink: draft.interviewLink ?? saved.interviewLink ?? "",
      interviewLocation: draft.interviewLocation ?? saved.interviewLocation ?? "",
      interviewContact: draft.interviewContact ?? saved.interviewContact ?? "",
      offerAmount: draft.offerAmount ?? saved.offerAmount ?? "",
      offerCurrency: draft.offerCurrency ?? saved.offerCurrency ?? "INR",
      offerPeriod: draft.offerPeriod ?? saved.offerPeriod ?? "annually",
    };
  };

  const updateDetail = (item, field, value) => {
    setDetailsByApplication((current) => ({
      ...current,
      [item._id]: { ...getDetails(item), [field]: value },
    }));
  };

  const updateApplication = (item, payload, successMessage) => axios.post(
    `${APPLICANT_API_ENDPOINT}/status/${item._id}/update`,
    payload,
    { withCredentials: true }
  ).then((res) => {
    if (!res.data.success) throw new Error(res.data.message || "Unable to update application.");
    dispatch(updateApplicantStage({
      applicationId: item._id,
      status: res.data.application.status,
      stageDetails: res.data.application.stageDetails,
      stageHistory: res.data.application.stageHistory,
      recruiterNotes: res.data.application.recruiterNotes,
    }));
    if (successMessage) toast.success(successMessage);
    return res.data.application;
  }).catch((error) => {
    toast.error(error?.response?.data?.message || error.message || "Unable to update application.");
    return null;
  });

  const interviewPayload = (item) => {
    const details = getDetails(item);
    if (!details.interviewDate || details.interviewDate < minInterviewDate) {
      toast.error("Choose a future interview date.");
      return null;
    }
    if (!details.interviewTime || !details.interviewMode) {
      toast.error("Choose an interview time and type.");
      return null;
    }
    if (details.interviewMode === "Online") {
      try {
        const meetingUrl = new URL(details.interviewLink);
        if (!["http:", "https:"].includes(meetingUrl.protocol)) throw new Error();
      } catch {
        toast.error("Enter a valid meeting link beginning with http:// or https://.");
        return null;
      }
    }
    if (details.interviewMode === "In-person" && !details.interviewLocation.trim()) {
      toast.error("Enter the interview location.");
      return null;
    }
    if (details.interviewMode === "Phone" && !details.interviewContact.trim()) {
      toast.error("Enter contact details for the phone interview.");
      return null;
    }
    return {
      interviewDate: `${details.interviewDate}T12:00:00.000Z`,
      interviewTime: details.interviewTime,
      interviewMode: details.interviewMode,
      interviewLink: details.interviewMode === "Online" ? details.interviewLink.trim() : "",
      interviewLocation: details.interviewMode === "In-person" ? details.interviewLocation.trim() : "",
      interviewContact: details.interviewMode === "Phone" ? details.interviewContact.trim() : "",
    };
  };

  const changeStage = async (item, status) => {
    const payload = { status };
    if (status === "interview scheduled") {
      const details = getDetails(item);
      if (details.interviewDate) {
        const interviewData = interviewPayload(item);
        if (interviewData) Object.assign(payload, interviewData);
      }
    }
    const updated = await updateApplication(item, payload);
    if (updated) {
      setDetailsByApplication((current) => ({ ...current, [item._id]: {} }));
      toast.success(`Candidate moved to "${stageLabel(status)}".`);
      if (status === "interview scheduled" && !item.stageDetails?.interviewDate) {
        setExpandedApplication(item._id);
        toast.info("Enter the interview date, time, and link/location in the manager below.");
      }
    }
  };

  const saveInterview = async (item) => {
    const payload = interviewPayload(item);
    if (!payload) return;
    const updated = await updateApplication(item, payload, "Interview details saved.");
    if (updated) setDetailsByApplication((current) => ({ ...current, [item._id]: {} }));
  };

  const saveOffer = async (item) => {
    const details = getDetails(item);
    const amount = Number(details.offerAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Enter a compensation amount greater than zero.");
      return;
    }
    const offerSalary = formatOffer(amount, details.offerCurrency, details.offerPeriod);
    if (offerSalary.length > 100) {
      toast.error("The compensation amount is too large to save.");
      return;
    }
    const updated = await updateApplication(item, {
      offerAmount: amount,
      offerCurrency: details.offerCurrency,
      offerPeriod: details.offerPeriod,
      offerSalary,
      status: "offer issued",
    }, "Offer details saved.");
    if (updated) setDetailsByApplication((current) => ({ ...current, [item._id]: {} }));
  };

  const saveNotes = async (item) => {
    const recruiterNotes = notesByApplication[item._id] ?? item.recruiterNotes ?? "";
    const updated = await updateApplication(item, { recruiterNotes }, "Private notes saved.");
    if (updated) {
      setNotesByApplication((current) => ({ ...current, [item._id]: updated.recruiterNotes || "" }));
    }
  };

  const renderManager = (item) => {
    const stage = normalizeStage(item.status);
    const details = getDetails(item);
    const showInterview = ["shortlisted", "interview scheduled"].includes(stage) ||
      Boolean(item.stageDetails?.interviewDate);
    const showOffer = ["offer issued", "offer accepted"].includes(stage) || Boolean(item.stageDetails?.offerSalary);
    const inputClass = "mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100";

    return (
      <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-2">
        {showInterview && (
          <section className="rounded-xl border border-violet-100 bg-white p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                <CalendarDays className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-semibold text-slate-900">Interview Scheduling</h3>
                <p className="text-xs text-slate-500">Choose a time and share the meeting details.</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-medium text-slate-600">
                Interview date
                <input
                  type="date"
                  min={minInterviewDate}
                  value={details.interviewDate}
                  onChange={(event) => updateDetail(item, "interviewDate", event.target.value)}
                  className={inputClass}
                />
                {details.interviewDate && <span className="mt-1 block text-xs text-violet-700">{formatDate(details.interviewDate)}</span>}
              </label>
              <label className="text-xs font-medium text-slate-600">
                Interview time
                <input
                  type="time"
                  step="60"
                  value={details.interviewTime}
                  onChange={(event) => updateDetail(item, "interviewTime", event.target.value)}
                  className={inputClass}
                />
                {details.interviewTime && <span className="mt-1 block text-xs text-violet-700">{formatTime(details.interviewTime)}</span>}
              </label>
              <label className="text-xs font-medium text-slate-600 sm:col-span-2">
                Interview type
                <select
                  value={details.interviewMode}
                  onChange={(event) => updateDetail(item, "interviewMode", event.target.value)}
                  className={inputClass}
                >
                  <option value="">Select type</option>
                  {interviewModes.map((mode) => <option key={mode} value={mode}>{mode}</option>)}
                  {["Offline", "Hybrid"].includes(details.interviewMode) && (
                    <option value={details.interviewMode}>{details.interviewMode} (existing)</option>
                  )}
                </select>
              </label>
              {details.interviewMode === "Online" && (
                <label className="text-xs font-medium text-slate-600 sm:col-span-2">
                  Meeting link
                  <span className="relative mt-1 block">
                    <Link2 className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="url"
                      value={details.interviewLink}
                      onChange={(event) => updateDetail(item, "interviewLink", event.target.value)}
                      placeholder="https://..."
                      className={`${inputClass} pl-9`}
                    />
                  </span>
                </label>
              )}
              {details.interviewMode === "In-person" && (
                <label className="text-xs font-medium text-slate-600 sm:col-span-2">
                  Interview location
                  <span className="relative mt-1 block">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      value={details.interviewLocation}
                      onChange={(event) => updateDetail(item, "interviewLocation", event.target.value)}
                      placeholder="Office address or meeting location"
                      maxLength={500}
                      className={`${inputClass} pl-9`}
                    />
                  </span>
                </label>
              )}
              {details.interviewMode === "Phone" && (
                <label className="text-xs font-medium text-slate-600 sm:col-span-2">
                  Contact details
                  <span className="relative mt-1 block">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      value={details.interviewContact}
                      onChange={(event) => updateDetail(item, "interviewContact", event.target.value)}
                      placeholder="Phone number or contact instructions"
                      maxLength={100}
                      className={`${inputClass} pl-9`}
                    />
                  </span>
                </label>
              )}
            </div>
            <Button type="button" onClick={() => saveInterview(item)} className="mt-4 w-full bg-violet-700 text-white hover:bg-violet-800 sm:w-auto">
              <Save className="mr-2 h-4 w-4" /> Save Interview Details
            </Button>
          </section>
        )}

        {showOffer && (
          <section className="rounded-xl border border-emerald-100 bg-white p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <DollarSign className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-semibold text-slate-900">Offer Details</h3>
                <p className="text-xs text-slate-500">Set compensation and pay frequency.</p>
              </div>
            </div>
            <label className="text-xs font-medium text-slate-600">
              Compensation amount
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={details.offerAmount}
                onChange={(event) => updateDetail(item, "offerAmount", event.target.value)}
                placeholder={item.stageDetails?.offerSalary || "Enter amount"}
                className={inputClass}
              />
            </label>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="text-xs font-medium text-slate-600">
                Currency
                <select
                  value={details.offerCurrency}
                  onChange={(event) => updateDetail(item, "offerCurrency", event.target.value)}
                  className={inputClass}
                >
                  {currencyOptions.map((currency) => <option key={currency} value={currency}>{currency}</option>)}
                </select>
              </label>
              <label className="text-xs font-medium text-slate-600">
                Salary period
                <select
                  value={details.offerPeriod}
                  onChange={(event) => updateDetail(item, "offerPeriod", event.target.value)}
                  className={inputClass}
                >
                  {salaryPeriods.map((period) => (
                    <option key={period} value={period}>{period.charAt(0).toUpperCase() + period.slice(1)}</option>
                  ))}
                </select>
              </label>
            </div>
            <Button type="button" onClick={() => saveOffer(item)} className="mt-4 w-full bg-emerald-700 text-white hover:bg-emerald-800 sm:w-auto">
              <Save className="mr-2 h-4 w-4" /> Save Offer Details
            </Button>
          </section>
        )}

        <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 lg:col-span-2">
          <div className="mb-3 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <StickyNote className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-semibold text-slate-900">Private Recruiter Notes</h3>
              <p className="text-xs text-slate-500">Only authorized recruiters can view these notes.</p>
            </div>
          </div>
          <textarea
            value={notesByApplication[item._id] ?? item.recruiterNotes ?? ""}
            onChange={(event) => setNotesByApplication((current) => ({ ...current, [item._id]: event.target.value }))}
            maxLength={5000}
            rows={4}
            placeholder="Add private feedback or observations about this candidate..."
            className="w-full resize-y rounded-lg border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-100"
          />
          <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs text-slate-400">{(notesByApplication[item._id] ?? item.recruiterNotes ?? "").length}/5000 characters</span>
            <Button type="button" variant="outline" onClick={() => saveNotes(item)} className="border-violet-200 text-violet-700 hover:bg-violet-50">
              <Save className="mr-2 h-4 w-4" /> Save Notes
            </Button>
          </div>
        </section>
      </div>
    );
  };

  const applicantDetails = (item) => (
    <>
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-semibold text-violet-800">
          {(item.applicant?.fullName || "?").trim().charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="break-words font-semibold text-slate-900">{item.applicant?.fullName || "Candidate"}</p>
          <p className="mt-0.5 break-all text-sm text-slate-500 xl:hidden">{item.applicant?.email || "No email provided"}</p>
        </div>
      </div>
    </>
  );

  const stageControl = (item) => {
    const stage = normalizeStage(item.status);
    return (
      <div className="flex flex-col gap-2">
        <span className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles[stage]}`}>
          {stageLabel(stage)}
        </span>
        <select
          aria-label={`Update application stage for ${item.applicant?.fullName || "candidate"}`}
          value={stage}
          onChange={(event) => changeStage(item, event.target.value)}
          className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 outline-none transition hover:border-violet-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
        >
          {stages.map((option) => <option key={option} value={option}>{stageLabel(option)}</option>)}
        </select>
      </div>
    );
  };

  const manageButton = (item) => {
    const isExpanded = expandedApplication === item._id;
    return (
      <Button
        type="button"
        variant="outline"
        aria-expanded={isExpanded}
        onClick={() => setExpandedApplication(isExpanded ? null : item._id)}
        className="w-full border-violet-200 text-violet-700 hover:bg-violet-50"
      >
        {isExpanded ? "Close" : "Manage"}
        {isExpanded ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
      </Button>
    );
  };

  if (!applications.length) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white px-5 py-16 text-center shadow-sm">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
          <Users className="h-7 w-7" />
        </span>
        <h2 className="mt-4 text-xl font-semibold text-slate-900">No applicants yet</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
          Applications will appear here when candidates apply for this job.
        </p>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-semibold text-slate-900">Applicants</h2>
          <p className="mt-1 text-sm text-slate-500">
            Showing <span className="font-semibold text-slate-700">{visibleApplications.length}</span> of {applications.length} candidates
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-[minmax(220px,1fr)_190px]">
          <label className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email or phone"
              aria-label="Search candidates by name, email or phone"
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            />
          </label>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter applicants by status"
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
          >
            <option value="all">All stages</option>
            {stages.map((stage) => <option key={stage} value={stage}>{stageLabel(stage)}</option>)}
          </select>
        </div>
      </div>

      <div className="hidden overflow-x-auto xl:block">
        <table className="w-full min-w-[1120px] table-fixed text-left text-sm">
          <colgroup>
            <col className="w-[18%]" />
            <col className="w-[18%]" />
            <col className="w-[12%]" />
            <col className="w-[15%]" />
            <col className="w-[12%]" />
            <col className="w-[15%]" />
            <col className="w-[10%]" />
          </colgroup>
          <thead className="bg-violet-50/70 text-xs uppercase tracking-wide text-violet-800">
            <tr>
              {["Candidate name", "Email address", "Contact number", "Resume", "Applied date", "Application stage", "Actions"].map((heading) => (
                <th key={heading} scope="col" className="px-4 py-3.5 font-semibold">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleApplications.map((item) => (
              <Fragment key={item._id}>
                <tr className="border-b border-slate-100 transition-colors hover:bg-violet-50/40">
                  <td className="px-4 py-4">{applicantDetails(item)}</td>
                  <td className="break-all px-4 py-4 text-slate-600">{item.applicant?.email || "-"}</td>
                  <td className="break-words px-4 py-4 text-slate-600">{item.applicant?.phoneNumber || "-"}</td>
                  <td className="px-4 py-4">
                    {item.applicant?.profile?.resume ? (
                      <a href={item.applicant.profile.resume} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-full items-center gap-2 text-violet-700 transition hover:text-violet-900 hover:underline">
                        <FileText className="h-4 w-4 shrink-0" />
                        <span className="truncate">{item.applicant.profile.resumeOriginalName || "View resume"}</span>
                      </a>
                    ) : <span className="text-slate-400">No resume</span>}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-"}
                  </td>
                  <td className="px-4 py-4">{stageControl(item)}</td>
                  <td className="px-4 py-4">{manageButton(item)}</td>
                </tr>
                {expandedApplication === item._id && (
                  <tr className="border-b border-slate-200 bg-slate-50/70">
                    <td colSpan={7} className="p-0">{renderManager(item)}</td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-slate-100 xl:hidden">
        {visibleApplications.map((item) => (
          <article key={item._id} className="p-4 transition-colors hover:bg-violet-50/30 sm:p-5">
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0">{applicantDetails(item)}</div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles[normalizeStage(item.status)]}`}>
                {stageLabel(normalizeStage(item.status))}
              </span>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3 text-sm">
              <div className="min-w-0">
                <dt className="text-xs font-medium text-slate-400">Contact number</dt>
                <dd className="mt-1 break-words text-slate-700">{item.applicant?.phoneNumber || "-"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-400">Applied date</dt>
                <dd className="mt-1 text-slate-700">
                  {item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-"}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-xs font-medium text-slate-400">Resume</dt>
                <dd className="mt-1">
                  {item.applicant?.profile?.resume ? (
                    <a href={item.applicant.profile.resume} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-full items-center gap-2 text-violet-700 hover:underline">
                      <FileText className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.applicant.profile.resumeOriginalName || "View resume"}</span>
                    </a>
                  ) : <span className="text-slate-400">No resume</span>}
                </dd>
              </div>
            </dl>
            <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_140px]">
              {stageControl(item)}
              {manageButton(item)}
            </div>
            {expandedApplication === item._id && (
              <div className="-mx-4 mt-4 border-t border-slate-100 bg-slate-50/70 sm:-mx-5">
                {renderManager(item)}
              </div>
            )}
          </article>
        ))}
      </div>

      {visibleApplications.length === 0 && (
        <div className="px-5 py-12 text-center">
          <Search className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 font-medium text-slate-800">No applicants match your filters</p>
          <p className="mt-1 text-sm text-slate-500">Try another search term or application stage.</p>
        </div>
      )}
    </section>
  );
};

export default ApplicantsTable;
