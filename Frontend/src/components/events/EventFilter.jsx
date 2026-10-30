import React, { useState } from "react";
import { Filter } from "lucide-react";
import { Button } from "../ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";

const EventFilter = () => {
    const [category, setCategory] = useState("");
    const [mode, setMode] = useState("");
    const [price, setPrice] = useState("");

    const resetFilters = () => {
        setCategory("");
        setMode("");
        setPrice("");
    };

    return (
        <div className="flex flex-wrap items-center gap-4 bg-white rounded-xl border shadow-md p-4 mb-8">

            <div className="flex items-center gap-2">
                <Filter size={20} />
                <span className="font-semibold">
                    Filters
                </span>
            </div>

            {/* Category */}

            <Select value={category} onValueChange={setCategory}>
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

            <Select value={mode} onValueChange={setMode}>
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

            <Select value={price} onValueChange={setPrice}>
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