import { useDispatch, useSelector } from "react-redux";
import { Search, X } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { setSearchEventByText } from "@/redux/eventSlice";

const EventSearch = () => {
    const dispatch = useDispatch();
    const search = useSelector((store) => store.event.searchEventByText);

    const clearSearch = () => {
        dispatch(setSearchEventByText(""));
    };

    return (
        <div className="flex items-center gap-3 bg-white shadow-md border rounded-xl p-3 my-8">

            {/* Search Icon */}
            <Search className="text-gray-500" size={20} />

            {/* Input */}
            <Input
                type="text"
                placeholder="Search events, workshops, hackathons..."
                value={search}
                onChange={(e) => dispatch(setSearchEventByText(e.target.value))}
                className="border-0 shadow-none focus-visible:ring-0"
            />

            {/* Clear Button */}
            {search && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearSearch}
                >
                    <X size={18} />
                </Button>
            )}
        </div>
    );
};

export default EventSearch;