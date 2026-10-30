import { Event } from "../models/event.model.js";

// Create Event
export const createEvent = async (req, res) => {
  try {
    const event = await Event.create({
      ...req.body,
      createdBy: req.id,
    });

    return res.status(201).json({
      success: true,
      message: "Event created successfully",
      event,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAdminEvents = async (req, res) => {
  try {
    const events = await Event.find({ createdBy: req.id }).sort({ eventDate: 1 });
    return res.status(200).json({
      success: true,
      events,
    });
  } catch (error) {
    console.error("Recruiter event lookup failed:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load your events.",
    });
  }
};

// Get All Events
export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ eventDate: 1 });

    return res.status(200).json({
      success: true,
      events,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Single Event
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    return res.status(200).json({
      success: true,
      event,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Event
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
      createdBy: req.id,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    const editableFields = [
      "title",
      "description",
      "organizer",
      "speaker",
      "category",
      "mode",
      "location",
      "eventDate",
      "registrationDeadline",
      "registrationLink",
      "banner",
      "price",
      "totalSeats",
      "seatsLeft",
    ];
    for (const field of editableFields) {
      if (req.body[field] !== undefined) {
        event[field] = req.body[field];
      }
    }
    await event.save();

    return res.status(200).json({
      success: true,
      message: "Event updated successfully",
      event,
    });
  } catch (error) {
    console.error("Event update failed:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Event
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.id,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Event deletion failed:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};