import { CalendarDays, MapPin, Users, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "sonner";
import { EVENT_API_ENDPOINT } from "@/utils/constant";
import { setEventRegistration } from "@/redux/eventSlice";

const EventCard = ({ event }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((store) => store.auth.user);
  const registrationClosed = new Date(event?.registrationDeadline) <= new Date() ||
    new Date(event?.eventDate) <= new Date() ||
    event?.seatsLeft <= 0;

  const registerForEvent = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "student") {
      toast.error("Only student accounts can register for events.");
      return;
    }
    try {
      const { data } = await axios.post(
        `${EVENT_API_ENDPOINT}/${event._id}/register`,
        {},
        { withCredentials: true }
      );
      if (!data.success) throw new Error(data.message || "Unable to register for this event.");
      dispatch(setEventRegistration({
        eventId: event._id,
        isRegistered: true,
        seatsLeft: data.event.seatsLeft,
        registrationCount: data.event.registrationCount,
      }));
      toast.success(data.message || "You are registered for this event.");
    } catch (error) {
      console.error("Event registration failed:", error);
      toast.error(error?.response?.data?.message || error.message || "Unable to register for this event.");
    }
  };

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
        <p className="mt-1 text-sm font-medium text-violet-700">
          {event?.company?.name || event?.organizer}
        </p>

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
            onClick={registerForEvent}
            disabled={event?.isRegistered || registrationClosed}
          >
            {event?.isRegistered ? "Registered" : registrationClosed ? "Registration closed" : "Register"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

        </div>

      </div>
    </div>
  );
};

export default EventCard;