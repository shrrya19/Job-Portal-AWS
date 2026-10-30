import React, { useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

const EventSearch = () => {
    const [search, setSearch] = useState("");

    const clearSearch = () => {
        setSearch("");
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
                onChange={(e) => setSearch(e.target.value)}
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