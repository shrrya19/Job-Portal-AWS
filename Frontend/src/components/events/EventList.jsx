import { useSelector } from "react-redux";
import EventCard from "./EventCard";

const EventList = () => {
    const { allEvents, searchEventByText, eventFilters } = useSelector((store) => store.event);
    const query = searchEventByText.trim().toLowerCase();
    const filteredEvents = allEvents.filter((event) => {
        const matchesSearch = !query || [
            event.title,
            event.description,
            event.organizer,
            event.company?.name,
            event.category,
            event.location,
        ].some((value) => value?.toLowerCase().includes(query));
        const matchesCategory = !eventFilters.category || event.category === eventFilters.category;
        const matchesMode = !eventFilters.mode || event.mode === eventFilters.mode;
        const matchesPrice = !eventFilters.price ||
            (eventFilters.price === "Free" ? Number(event.price) === 0 : Number(event.price) > 0);
        return matchesSearch && matchesCategory && matchesMode && matchesPrice;
    });

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

    if (filteredEvents.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
                <h2 className="text-xl font-semibold text-slate-800">No events match your search</h2>
                <p className="mt-2 text-sm text-slate-500">Try another search or reset your category, mode, and price filters.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
                <EventCard
                    key={event._id}
                    event={event}
                />
            ))}
        </div>
    );
};

export default EventList;