import React from "react";
import { useSelector } from "react-redux";
import EventCard from "./EventCard";

const FeaturedEvents = () => {
    const { allEvents } = useSelector((store) => store.event);

    // Sirf pehle 3 events dikhayenge
    const featuredEvents = allEvents.slice(0, 3);

    if (featuredEvents.length === 0) return null;

    return (
        <section className="my-12">

            <div className="flex items-center justify-between mb-6">

                <div>
                    <h2 className="text-3xl font-bold">
                        ⭐ Featured Events
                    </h2>

                    <p className="text-gray-500 mt-2">
                        Explore the most popular upcoming tech events.
                    </p>
                </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {
                    featuredEvents.map((event) => (
                        <EventCard
                            key={event._id}
                            event={event}
                        />
                    ))
                }

            </div>

        </section>
    );
};

export default FeaturedEvents;