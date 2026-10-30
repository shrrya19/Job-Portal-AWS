import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

import {
    CalendarDays,
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

const EventDetails = () => {

    const { id } = useParams();

    const [event, setEvent] = useState(null);

    useEffect(() => {

        const fetchEvent = async () => {
            try {

                const res = await axios.get(`${EVENT_API_ENDPOINT}/${id}`, {
                    withCredentials: true,
                });

                if (res.data.success) {
                    setEvent(res.data.event);
                }

            } catch (error) {
                console.log(error);
            }
        };

        fetchEvent();

    }, [id]);

    if (!event) {
        return (
            <div className="text-center py-24 text-xl">
                Loading Event...
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto py-10 px-4">

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
                            <strong>Organizer :</strong> {event.organizer}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <Users />
                        <span>
                            <strong>Speaker :</strong> {event.speaker}
                        </span>
                    </div>

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
                        <span>
                            <strong>Seats Left :</strong> {event.seatsLeft}
                        </span>
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
                        onClick={() =>
                            window.open(event.registrationLink, "_blank")
                        }
                    >
                        Register Now
                    </Button>

                </div>

            </div>

        </div>
    );
};

export default EventDetails;