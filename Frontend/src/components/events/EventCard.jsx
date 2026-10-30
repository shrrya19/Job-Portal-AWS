import React from "react";
import { CalendarDays, MapPin, Users, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useNavigate } from "react-router-dom";

const EventCard = ({ event }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl shadow-md border hover:shadow-xl transition-all duration-300 overflow-hidden">

      {/* Banner */}
      <img
        src={
          event?.banner ||
          "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200"
        }
        alt={event?.title}
        className="w-full h-52 object-cover"
      />

      <div className="p-5">

        {/* Category */}
        <Badge className="mb-3">
          {event?.category}
        </Badge>

        {/* Title */}
        <h2 className="text-xl font-bold line-clamp-2">
          {event?.title}
        </h2>

        {/* Description */}
        <p className="text-gray-500 mt-2 line-clamp-3">
          {event?.description}
        </p>

        {/* Event Date */}
        <div className="flex items-center gap-2 mt-4 text-sm text-gray-600">
          <CalendarDays size={18} />
          <span>
            {new Date(event?.eventDate).toLocaleDateString()}
          </span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
          <MapPin size={18} />
          <span>{event?.location}</span>
        </div>

        {/* Seats */}
        <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
          <Users size={18} />
          <span>{event?.seatsLeft} Seats Left</span>
        </div>

        {/* Buttons */}
        <div className="flex justify-between items-center mt-6">

          <Button
            variant="outline"
            onClick={() => navigate(`/events/${event._id}`)}
          >
            Details
          </Button>

          <Button
            onClick={() => window.open(event.registrationLink, "_blank")}
          >
            Register
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

        </div>

      </div>
    </div>
  );
};

export default EventCard;