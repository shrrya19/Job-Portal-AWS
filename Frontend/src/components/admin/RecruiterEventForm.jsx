import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Loader2, Save } from "lucide-react";
import Navbar from "../shared/Navbar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { COMPANY_API_ENDPOINT, EVENT_API_ENDPOINT } from "@/utils/constant";
import { toast } from "sonner";

const categories = ["Workshop", "Hackathon", "Seminar", "Bootcamp", "Conference", "Webinar"];
const modes = ["Online", "Offline", "Hybrid"];

const blankEvent = {
  title: "",
  description: "",
  companyId: "",
  speaker: "",
  category: "Workshop",
  mode: "Online",
  location: "Online",
  eventDate: "",
  registrationDeadline: "",
  registrationLink: "",
  banner: "",
  price: "0",
  totalSeats: "100",
};

const toLocalInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const toLocalDateTime = () => {
  const date = new Date();
  date.setSeconds(0, 0);
  date.setMinutes(date.getMinutes() + 1);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const RecruiterEventForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [form, setForm] = useState(blankEvent);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const minDateTime = toLocalDateTime();
  const eventDateIsPast = form.eventDate && new Date(form.eventDate) < new Date();
  const deadlineIsPast = form.registrationDeadline && new Date(form.registrationDeadline) < new Date();
  const deadlineAfterEvent = form.registrationDeadline && form.eventDate &&
    new Date(form.registrationDeadline) > new Date(form.eventDate);

  useEffect(() => {
    let active = true;
    const loadFormData = async () => {
      try {
        const [companiesResponse, eventResponse] = await Promise.all([
          axios.get(`${COMPANY_API_ENDPOINT}/get`, { withCredentials: true }),
          isEditing
            ? axios.get(`${EVENT_API_ENDPOINT}/admin/${id}`, { withCredentials: true })
            : Promise.resolve(null),
        ]);
        if (!companiesResponse.data.success) throw new Error("Unable to load your companies.");
        const ownedCompanies = companiesResponse.data.companies || [];
        if (!active) return;
        setCompanies(ownedCompanies);

        if (isEditing) {
          if (!eventResponse?.data?.success) throw new Error(eventResponse?.data?.message || "Unable to load this event.");
          const event = eventResponse.data.event;
          setForm({
            title: event.title || "",
            description: event.description || "",
            companyId: event.company?._id || event.company || "",
            speaker: event.speaker || "",
            category: event.category || "Workshop",
            mode: event.mode || "Online",
            location: event.location || "",
            eventDate: toLocalInput(event.eventDate),
            registrationDeadline: toLocalInput(event.registrationDeadline),
            registrationLink: event.registrationLink || "",
            banner: event.banner || "",
            price: String(event.price ?? 0),
            totalSeats: String(event.totalSeats ?? 100),
          });
        } else if (ownedCompanies.length === 1) {
          setForm((current) => ({ ...current, companyId: ownedCompanies[0]._id }));
        }
      } catch (error) {
        console.error("Event form data loading failed:", error);
        if (active) setLoadError(error?.response?.data?.message || error.message || "Unable to load the event form.");
      } finally {
        if (active) setLoading(false);
      }
    };
    loadFormData();
    return () => {
      active = false;
    };
  }, [id, isEditing]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!companies.length) {
      toast.error("Create a company profile before publishing an event.");
      return;
    }
    if (!form.eventDate || !form.registrationDeadline) {
      toast.error("Choose both the event date and registration deadline.");
      return;
    }
    if (new Date(form.eventDate) <= new Date()) {
      toast.error("Choose an event date and time in the future.");
      return;
    }
    if (new Date(form.registrationDeadline) <= new Date() ||
        new Date(form.registrationDeadline) > new Date(form.eventDate)) {
      toast.error("Registration deadline must be in the future and no later than the event date.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        eventDate: new Date(form.eventDate).toISOString(),
        registrationDeadline: new Date(form.registrationDeadline).toISOString(),
        price: Number(form.price),
        totalSeats: Number(form.totalSeats),
      };
      const response = isEditing
        ? await axios.put(`${EVENT_API_ENDPOINT}/${id}`, payload, { withCredentials: true })
        : await axios.post(EVENT_API_ENDPOINT, payload, { withCredentials: true });
      if (!response.data.success) throw new Error(response.data.message || "Unable to save this event.");
      toast.success(response.data.message || (isEditing ? "Event updated." : "Event created."));
      navigate("/admin/events");
    } catch (error) {
      console.error("Event save failed:", error);
      toast.error(error?.response?.data?.message || error.message || "Unable to save this event.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "mt-1.5 h-11 rounded-xl";

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <Link to="/admin/events" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-900">
            <ArrowLeft size={17} /> Back to events
          </Link>
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-gradient-to-r from-violet-50 to-white p-6 sm:p-8">
              <span className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-800"><CalendarDays size={14} /> Recruiter workspace</span>
              <h1 className="mt-3 text-2xl font-bold text-slate-900">{isEditing ? "Edit tech event" : "Create a tech event"}</h1>
              <p className="mt-1 text-sm text-slate-600">Publish a company event for students to discover and register for.</p>
            </div>

            {loadError ? (
              <div role="alert" className="m-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{loadError}</div>
            ) : loading ? (
              <div className="flex items-center justify-center gap-2 p-16 text-sm text-slate-500"><Loader2 size={18} className="animate-spin" /> Loading event...</div>
            ) : !companies.length ? (
              <div className="m-6 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
                <p className="font-semibold">Create a company profile first</p>
                <p className="mt-1">Events are published under a company owned by your recruiter account.</p>
                <Link to="/admin/companies/create" className="mt-3 inline-flex font-semibold text-violet-800 underline">Create company profile</Link>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-6 p-6 sm:p-8">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor="title">Event title *</Label>
                    <Input id="title" name="title" value={form.title} onChange={updateField} required minLength={3} maxLength={150} className={inputClass} placeholder="e.g. Building with Generative AI" />
                  </div>
                  <div>
                    <Label htmlFor="companyId">Company *</Label>
                    <select id="companyId" name="companyId" value={form.companyId} onChange={updateField} required className="mt-1.5 h-11 w-full rounded-xl border border-input bg-white px-3 text-sm">
                      <option value="">Select your company</option>
                      {companies.map((company) => <option key={company._id} value={company._id}>{company.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="category">Event category *</Label>
                    <select id="category" name="category" value={form.category} onChange={updateField} required className="mt-1.5 h-11 w-full rounded-xl border border-input bg-white px-3 text-sm">
                      {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="mode">Event format *</Label>
                    <select id="mode" name="mode" value={form.mode} onChange={updateField} required className="mt-1.5 h-11 w-full rounded-xl border border-input bg-white px-3 text-sm">
                      {modes.map((mode) => <option key={mode} value={mode}>{mode}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="location">Location / venue *</Label>
                    <Input id="location" name="location" value={form.location} onChange={updateField} required maxLength={200} className={inputClass} placeholder={form.mode === "Online" ? "Online" : "City, venue or meeting details"} />
                  </div>
                  <div>
                    <Label htmlFor="eventDate">Event date and time *</Label>
                    <Input id="eventDate" name="eventDate" type="datetime-local" value={form.eventDate} onChange={updateField} min={minDateTime} required aria-invalid={Boolean(eventDateIsPast)} aria-describedby="event-date-help" className={inputClass} />
                    <p id="event-date-help" className={`mt-1 text-xs ${eventDateIsPast ? "text-red-600" : "text-slate-500"}`}>
                      {eventDateIsPast ? "Event date must be in the future." : "Choose a future date and time."}
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="registrationDeadline">Registration deadline (before the event) *</Label>
                    <Input id="registrationDeadline" name="registrationDeadline" type="datetime-local" value={form.registrationDeadline} onChange={updateField} min={minDateTime} max={form.eventDate || undefined} required aria-invalid={Boolean(deadlineIsPast || deadlineAfterEvent)} aria-describedby="registration-deadline-help" className={inputClass} />
                    <p id="registration-deadline-help" className={`mt-1 text-xs ${deadlineIsPast || deadlineAfterEvent ? "text-red-600" : "text-slate-500"}`}>
                      {deadlineAfterEvent
                        ? "Choose a deadline on or before the event date."
                        : deadlineIsPast
                          ? "Registration deadline must be in the future."
                          : form.eventDate
                            ? `Deadline must be no later than ${new Date(form.eventDate).toLocaleString()}.`
                            : "Select an event date first; the deadline must be before it."}
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="speaker">Speaker (optional)</Label>
                    <Input id="speaker" name="speaker" value={form.speaker} onChange={updateField} maxLength={150} className={inputClass} placeholder="Speaker name" />
                  </div>
                  <div>
                    <Label htmlFor="totalSeats">Available seats *</Label>
                    <Input id="totalSeats" name="totalSeats" type="number" value={form.totalSeats} onChange={updateField} min="1" max="1000000" step="1" required className={inputClass} />
                  </div>
                  <div>
                    <Label htmlFor="price">Price (₹) *</Label>
                    <Input id="price" name="price" type="number" value={form.price} onChange={updateField} min="0" max="10000000" step="0.01" required className={inputClass} />
                  </div>
                  <div>
                    <Label htmlFor="banner">Banner image URL (optional)</Label>
                    <Input id="banner" name="banner" type="url" value={form.banner} onChange={updateField} className={inputClass} placeholder="https://example.com/event-banner.jpg" />
                  </div>
                  <div>
                    <Label htmlFor="registrationLink">External registration / meeting link (optional)</Label>
                    <Input id="registrationLink" name="registrationLink" type="url" value={form.registrationLink} onChange={updateField} className={inputClass} placeholder="https://..." />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="description">Event description *</Label>
                    <textarea id="description" name="description" value={form.description} onChange={updateField} required minLength={20} maxLength={10000} rows={6} className="mt-1.5 w-full rounded-xl border border-input bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="Describe the event agenda, topics, and what students will learn." />
                  </div>
                </div>
                <div className="flex flex-col-reverse justify-end gap-3 border-t border-slate-100 pt-5 sm:flex-row">
                  <Button type="button" variant="outline" onClick={() => navigate("/admin/events")} className="rounded-xl">Cancel</Button>
                  <Button type="submit" disabled={saving} className="rounded-xl bg-violet-700 hover:bg-violet-800">
                    {saving ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Save size={16} className="mr-2" />}
                    {saving ? "Saving..." : isEditing ? "Save changes" : "Publish event"}
                  </Button>
                </div>
              </form>
            )}
          </section>
        </div>
      </main>
    </>
  );
};

export default RecruiterEventForm;
