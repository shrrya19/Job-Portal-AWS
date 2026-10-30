import React from "react";
import { CalendarDays, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import Navbar from "../shared/Navbar";

const EventHero = () => {
    return (
        <div>
            <Navbar />
            <section className="relative overflow-hidden rounded-4xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-white px-8 md:px-15 py-8 md:py-5 m-5">

                <div className="absolute inset-0 bg-black/10"></div>

                <div className="relative z-10 max-w-4xl">

                    <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-6 backdrop-blur">

                        <CalendarDays size={18} />

                        <span className="text-sm font-medium">
                            Discover the Latest Tech Events
                        </span>

                    </div>

                    <h1 className="text-5xl font-bold leading-tight">

                        Level Up Your Career

                        <br />

                        With Amazing Tech Events 🚀

                    </h1>

                    <p className="mt-6 text-lg text-gray-100 max-w-2xl">

                        Join workshops, hackathons, coding contests,
                        webinars, conferences and networking events from
                        top tech companies and developer communities.

                    </p>

                    <div className="flex flex-wrap gap-4 mt-8">

                        <Button
                            size="lg"
                            className="bg-white text-black hover:bg-gray-200"
                        >
                            Explore Events

                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>

                        <Button
                            size="lg"
                            variant="secondary"
                        >
                            Browse Categories
                        </Button>

                    </div>

                </div>

            </section>
        </div>
    );
};

export default EventHero;