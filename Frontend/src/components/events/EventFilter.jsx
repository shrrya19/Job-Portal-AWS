import { useDispatch, useSelector } from "react-redux";
import { Filter } from "lucide-react";
import { Button } from "../ui/button";
import { setEventFilters, resetEventFilters } from "@/redux/eventSlice";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";

const DEFAULT_EVENT_FILTERS = { category: "", mode: "", price: "" };

const EventFilter = () => {
    const dispatch = useDispatch();
    const eventFilters = useSelector((store) => store.event?.eventFilters) || DEFAULT_EVENT_FILTERS;
    const category = eventFilters.category || "";
    const mode = eventFilters.mode || "";
    const price = eventFilters.price || "";

    const resetFilters = () => {
        dispatch(resetEventFilters());
    };

    return (
        <div id="event-filters" className="scroll-mt-24 flex flex-wrap items-center gap-4 bg-white rounded-xl border shadow-md p-4 mb-8">

            <div className="flex items-center gap-2">
                <Filter size={20} />
                <span className="font-semibold">
                    Filters
                </span>
            </div>

            {/* Category */}

            <Select value={category} onValueChange={(value) => dispatch(setEventFilters({ category: value }))}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                </SelectTrigger>

                <SelectContent>
                    <SelectItem value="Workshop">Workshop</SelectItem>
                    <SelectItem value="Hackathon">Hackathon</SelectItem>
                    <SelectItem value="Conference">Conference</SelectItem>
                    <SelectItem value="Seminar">Seminar</SelectItem>
                    <SelectItem value="Bootcamp">Bootcamp</SelectItem>
                    <SelectItem value="Webinar">Webinar</SelectItem>
                </SelectContent>
            </Select>

            {/* Mode */}

            <Select value={mode} onValueChange={(value) => dispatch(setEventFilters({ mode: value }))}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Mode" />
                </SelectTrigger>

                <SelectContent>
                    <SelectItem value="Online">Online</SelectItem>
                    <SelectItem value="Offline">Offline</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                </SelectContent>
            </Select>

            {/* Price */}

            <Select value={price} onValueChange={(value) => dispatch(setEventFilters({ price: value }))}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Price" />
                </SelectTrigger>

                <SelectContent>
                    <SelectItem value="Free">Free</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                </SelectContent>
            </Select>

            {/* Reset */}

            <Button
                variant="outline"
                onClick={resetFilters}
            >
                Reset Filters
            </Button>

        </div>
    );
};

export default EventFilter;