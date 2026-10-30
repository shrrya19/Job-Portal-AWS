import React from "react";
import { useSelector } from "react-redux";
import EventCard from "./EventCard";

const EventList = () => {
    const { allEvents } = useSelector((store) => store.event);

    if (allEvents.length === 0) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-semibold">
                    No Upcoming Events
                </h2>
                <p className="text-gray-500 mt-2">
                    New tech events will appear here.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allEvents.map((event) => (
                <EventCard
                    key={event._id}
                    event={event}
                />
            ))}
        </div>
    );
};

export default EventList;