import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { CalendarDays, Loader2, Pencil, Plus, Search, Trash2, Users } from "lucide-react";
import Navbar from "../shared/Navbar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { EVENT_API_ENDPOINT } from "@/utils/constant";
import { toast } from "sonner";

const RecruiterEvents = () => {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const fetchEvents = useCallback(async () => {
    try {
      const { data } = await axios.get(`${EVENT_API_ENDPOINT}/admin`, { withCredentials: true });
      if (!data.success) throw new Error(data.message || "Unable to load your events.");
      setEvents(data.events || []);
    } catch (error) {
      console.error("Recruiter event list loading failed:", error);
      setLoadError(error?.response?.data?.message || error.message || "Unable to load your events.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(fetchEvents, 0);
    return () => window.clearTimeout(timer);
  }, [fetchEvents]);

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return events;
    return events.filter((event) =>
      [event.title, event.category, event.organizer, event.company?.name]
        .some((value) => value?.toLowerCase().includes(query))
    );
  }, [events, search]);

  const deleteEvent = async (event) => {
    if (!window.confirm(`Delete "${event.title}"? Students will no longer be able to view or register for it.`)) return;
    setDeletingId(event._id);
    try {
      const { data } = await axios.delete(`${EVENT_API_ENDPOINT}/${event._id}`, { withCredentials: true });
      if (!data.success) throw new Error(data.message || "Unable to delete this event.");
      setEvents((current) => current.filter((item) => item._id !== event._id));
      toast.success(data.message || "Event deleted.");
    } catch (error) {
      console.error("Event deletion failed:", error);
      toast.error(error?.response?.data?.message || error.message || "Unable to delete this event.");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <header className="flex flex-col justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold text-violet-700">Recruiter workspace</p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Company tech events</h1>
              <p className="mt-2 text-sm text-slate-600">Create events for students and manage registrations.</p>
            </div>
            <Link to="/admin/events/create" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 text-sm font-semibold text-white hover:bg-violet-800">
              <Plus size={17} /> Create event
            </Link>
          </header>

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-semibold text-slate-900">Your events <span className="text-slate-400">({events.length})</span></h2>
                <p className="mt-1 text-sm text-slate-500">Students can discover and register for published events from the Events page.</p>
              </div>
              <div className="relative w-full sm:max-w-xs">
                <Search size={17} className="absolute left-3 top-3 text-slate-400" />
                <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search events" className="pl-9" />
              </div>
            </div>

            {loadError ? (
              <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{loadError}</div>
            ) : loading ? (
              <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
                <Loader2 size={18} className="animate-spin" /> Loading events...
              </div>
            ) : filteredEvents.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-3 py-3 font-semibold">Event</th>
                      <th className="px-3 py-3 font-semibold">Date</th>
                      <th className="px-3 py-3 font-semibold">Registrations</th>
                      <th className="px-3 py-3 font-semibold">Status</th>
                      <th className="px-3 py-3 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredEvents.map((event) => {
                      const isPast = new Date(event.eventDate) <= new Date();
                      const registrationClosed = new Date(event.registrationDeadline) <= new Date();
                      return (
                        <tr key={event._id} className="align-middle">
                          <td className="px-3 py-4">
                            <p className="font-semibold text-slate-900">{event.title}</p>
                            <p className="mt-1 text-xs text-slate-500">{event.company?.name || event.organizer} · {event.category} · {event.mode}</p>
                          </td>
                          <td className="px-3 py-4 text-slate-600">{new Date(event.eventDate).toLocaleString()}</td>
                          <td className="px-3 py-4">
                            <span className="inline-flex items-center gap-1.5 text-slate-700"><Users size={15} />{event.registrationCount ?? 0} / {event.totalSeats}</span>
                            <p className="mt-1 text-xs text-slate-500">{event.seatsLeft} seats remaining</p>
                          </td>
                          <td className="px-3 py-4">
                            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${isPast ? "bg-slate-100 text-slate-600" : registrationClosed ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
                              {isPast ? "Completed" : registrationClosed ? "Registration closed" : "Open"}
                            </span>
                          </td>
                          <td className="px-3 py-4">
                            <div className="flex justify-end gap-2">
                              <Link to={`/events/${event._id}`} title="Preview event" aria-label={`Preview ${event.title}`} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">
                                Preview
                              </Link>
                              <Link to={`/admin/events/${event._id}/edit`} title="Edit event" aria-label={`Edit ${event.title}`} className="rounded-lg border border-violet-200 p-2 text-violet-700 hover:bg-violet-50">
                                <Pencil size={16} />
                              </Link>
                              <Button type="button" variant="outline" aria-label={`Delete ${event.title}`} disabled={deletingId === event._id} onClick={() => deleteEvent(event)} className="h-9 w-9 border-red-200 p-0 text-red-600 hover:bg-red-50">
                                {deletingId === event._id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-xl bg-slate-50 px-5 py-14 text-center">
                <CalendarDays size={30} className="mx-auto text-violet-600" />
                <h3 className="mt-3 font-semibold text-slate-900">{search ? "No matching events" : "No events yet"}</h3>
                <p className="mt-1 text-sm text-slate-500">{search ? "Try another search." : "Create a tech event to help students find and join it."}</p>
                {!search && <Link to="/admin/events/create" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-900"><Plus size={16} /> Create your first event</Link>}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
};

export default RecruiterEvents;
