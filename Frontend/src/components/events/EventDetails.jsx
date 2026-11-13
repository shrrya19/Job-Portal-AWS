import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import {
    CalendarDays,
    ArrowLeft,
    MapPin,
    Users,
    User,
    Laptop,
    IndianRupee,
} from "lucide-react";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import CountdownTimer from "./CountdownTimer";
import { EVENT_API_ENDPOINT } from "@/utils/constant";
import { toast } from "sonner";

const EventDetails = () => {

    const { id } = useParams();
    const navigate = useNavigate();
    const user = useSelector((store) => store.auth.user);

    const [event, setEvent] = useState(null);
    const [isRegistered, setIsRegistered] = useState(false);
    const [registering, setRegistering] = useState(false);
    const [loadError, setLoadError] = useState("");

    useEffect(() => {
        let active = true;
        const fetchEvent = async () => {
            try {
                const res = await axios.get(`${EVENT_API_ENDPOINT}/${id}`, {
                    withCredentials: true,
                });

                if (res.data.success) {
                    if (active) setEvent(res.data.event);
                } else {
                    throw new Error(res.data.message || "Unable to load event.");
                }
            } catch (error) {
                console.error("Event detail loading failed:", error);
                if (active) setLoadError(error?.response?.data?.message || error.message || "Unable to load event.");
            }

            if (user?.role === "student") {
                try {
                    const registrationRes = await axios.get(`${EVENT_API_ENDPOINT}/registered`, { withCredentials: true });
                    if (active) setIsRegistered((registrationRes.data.eventIds || []).includes(id));
                } catch (error) {
                    console.error("Student event registration lookup failed:", error);
                }
            }
        };

        fetchEvent();
        return () => {
            active = false;
        };
    }, [id, user?._id, user?.role]);

    const registerForEvent = async () => {
        if (!user) {
            navigate("/login");
            return;
        }
        if (user.role !== "student") {
            toast.error("Only student accounts can register for events.");
            return;
        }
        setRegistering(true);
        try {
            const { data } = await axios.post(`${EVENT_API_ENDPOINT}/${id}/register`, {}, { withCredentials: true });
            if (!data.success) throw new Error(data.message || "Unable to register for this event.");
            setEvent(data.event);
            setIsRegistered(true);
            toast.success(data.message || "You are registered for this event.");
        } catch (error) {
            console.error("Event registration failed:", error);
            toast.error(error?.response?.data?.message || error.message || "Unable to register for this event.");
        } finally {
            setRegistering(false);
        }
    };

    if (loadError) {
        return (
            <div className="mx-auto max-w-3xl px-4 py-10 text-center">
                <Button type="button" variant="outline" onClick={() => navigate(user?.role === "recruiter" ? "/admin/events" : "/events")}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to events
                </Button>
                <p role="alert" className="py-16 text-red-700">{loadError}</p>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="mx-auto max-w-6xl px-4 py-10">
                <Button type="button" variant="outline" onClick={() => navigate(user?.role === "recruiter" ? "/admin/events" : "/events")}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to events
                </Button>
                <div className="py-24 text-center text-xl" role="status">Loading Event...</div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto py-10 px-4">
            <Button
                type="button"
                variant="outline"
                onClick={() => navigate(window.history.state?.idx > 0 ? -1 : user?.role === "recruiter" ? "/admin/events" : "/events")}
                className="mb-6 border-violet-200 text-violet-700 hover:bg-violet-50"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {user?.role === "recruiter" ? "Back to Manage Events" : "Back to Events"}
            </Button>

            {/* Banner */}

            <img
                src={
                    event.banner ||
                    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200"
                }
                alt={event.title}
                className="w-full h-[420px] object-cover rounded-2xl"
            />

            <div className="mt-8">

                <Badge className="mb-4">
                    {event.category}
                </Badge>

                <h1 className="text-4xl font-bold">
                    {event.title}
                </h1>

                <p className="text-gray-600 mt-4 leading-8">
                    {event.description}
                </p>

                <CountdownTimer eventDate={event.eventDate} />

                <div className="grid md:grid-cols-2 gap-6 mt-8">

                    <div className="flex items-center gap-3">
                        <User />
                        <span>
                            <strong>Company :</strong> {event.company?.name || event.organizer}
                        </span>
                    </div>

                    {event.speaker && <div className="flex items-center gap-3">
                        <Users />
                        <span>
                            <strong>Speaker :</strong> {event.speaker}
                        </span>
                    </div>}

                    <div className="flex items-center gap-3">
                        <MapPin />
                        <span>
                            <strong>Location :</strong> {event.location}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <Laptop />
                        <span>
                            <strong>Mode :</strong> {event.mode}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <CalendarDays />
                        <span>
                            <strong>Event Date :</strong>{" "}
                            {new Date(event.eventDate).toLocaleDateString()}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <CalendarDays />
                        <span>
                            <strong>Registration Deadline :</strong>{" "}
                            {new Date(event.registrationDeadline).toLocaleDateString()}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <Users />
                        <span><strong>Seats :</strong> {event.seatsLeft} left of {event.totalSeats}</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <IndianRupee />
                        <span>
                            <strong>Price :</strong>{" "}
                            {event.price === 0 ? "Free" : `₹${event.price}`}
                        </span>
                    </div>

                </div>

                <div className="mt-10">

                    <Button
                        size="lg"
                        disabled={registering || isRegistered || event.seatsLeft <= 0 ||
                            new Date(event.registrationDeadline) <= new Date() ||
                            new Date(event.eventDate) <= new Date()}
                        onClick={registerForEvent}
                    >
                        {registering ? "Registering..." : isRegistered ? "You are registered" :
                            event.seatsLeft <= 0 ? "Event full" :
                                new Date(event.registrationDeadline) <= new Date() ? "Registration closed" : "Register for event"}
                    </Button>
                    {event.registrationLink && (
                        <a
                            href={event.registrationLink}
                            target="_blank"
                            rel="noreferrer"
                            className="ml-3 text-sm font-medium text-violet-700 underline"
                        >
                            External event link
                        </a>
                    )}

                </div>

            </div>

        </div>
    );
};

export default EventDetails;