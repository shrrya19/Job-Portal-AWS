import React from "react";

import useGetAllEvents from "@/hooks/useGetAllEvents";

import EventHero from "./EventHero";
import FeaturedEvents from "./FeaturedEvents";
import EventSearch from "./EventSearch";
import EventFilter from "./EventFilter";
import EventList from "./EventList";

const Events = () => {
    // Fetch all events from backend
    useGetAllEvents();

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Hero Section */}
            <EventHero />

            <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">

                {/* Featured Events */}
                <FeaturedEvents />

                {/* Search */}
                <EventSearch />

                {/* Filters */}
                <EventFilter />

                {/* All Events */}
                <div className="mt-10">

                    <div className="flex items-center justify-between mb-6">

                        <div>

                            <h2 className="text-3xl font-bold">
                                All Upcoming Events
                            </h2>

                            <p className="text-gray-500 mt-2">
                                Explore workshops, hackathons, webinars,
                                conferences and bootcamps.
                            </p>

                        </div>

                    </div>

                    <EventList />

                </div>

            </div>

        </div>
    );
};

export default Events;