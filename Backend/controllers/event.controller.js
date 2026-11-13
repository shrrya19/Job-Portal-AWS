import mongoose from "mongoose";
import { Company } from "../models/company.model.js";
import { Event } from "../models/event.model.js";
import { validateEventPayload } from "../utils/eventValidation.js";

const serializeEvent = (event) => {
  const data = event.toObject();
  const registrations = data.registrations || [];
  delete data.registrations;
  data.registrationCount = registrations.length;
  return data;
};

const getOwnedCompany = async (companyId, recruiterId) => {
  if (!mongoose.isValidObjectId(companyId)) return null;
  return Company.findOne({ _id: companyId, userId: recruiterId });
};

// Create Event
export const createEvent = async (req, res) => {
  try {
    const validation = validateEventPayload(req.body);
    if (validation.error) {
      return res.status(400).json({ success: false, message: validation.error });
    }

    const company = await getOwnedCompany(validation.value.companyId, req.id);
    if (!company) {
      return res.status(404).json({ success: false, message: "Select one of your companies." });
    }

    const { companyId, ...eventData } = validation.value;
    const event = await Event.create({
      ...eventData,
      company: company._id,
      organizer: company.name,
      createdBy: req.id,
      seatsLeft: eventData.totalSeats,
    });

    return res.status(201).json({
      success: true,
      message: "Event created successfully",
      event: serializeEvent(event),
    });
  } catch (error) {
    console.error("Event creation failed:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to create the event.",
    });
  }
};

export const getAdminEvents = async (req, res) => {
  try {
    const events = await Event.find({ createdBy: req.id })
      .populate("company", "name logo")
      .sort({ eventDate: 1 });
    return res.status(200).json({
      success: true,
      events: events.map(serializeEvent),
    });
  } catch (error) {
    console.error("Recruiter event lookup failed:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load your events.",
    });
  }
};

export const getAdminEventById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid event ID." });
    }
    const event = await Event.findOne({ _id: req.params.id, createdBy: req.id })
      .populate("company", "name logo");
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found." });
    }
    return res.status(200).json({ success: true, event: serializeEvent(event) });
  } catch (error) {
    console.error("Recruiter event lookup failed:", error);
    return res.status(500).json({ success: false, message: "Unable to load this event." });
  }
};

// Get All Events
export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find({ eventDate: { $gte: new Date() } })
      .populate("company", "name logo")
      .sort({ eventDate: 1 });

    return res.status(200).json({
      success: true,
      events: events.map(serializeEvent),
    });
  } catch (error) {
    console.error("Public event lookup failed:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load events.",
    });
  }
};

export const getRegisteredEventIds = async (req, res) => {
  try {
    const events = await Event.find({ "registrations.student": req.id }).select("_id");
    return res.status(200).json({
      success: true,
      eventIds: events.map((event) => event._id.toString()),
    });
  } catch (error) {
    console.error("Student event registration lookup failed:", error);
    return res.status(500).json({ success: false, message: "Unable to load your event registrations." });
  }
};

export const registerForEvent = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid event ID." });
    }
    const now = new Date();
    const event = await Event.findOneAndUpdate(
      {
        _id: req.params.id,
        eventDate: { $gt: now },
        registrationDeadline: { $gt: now },
        seatsLeft: { $gt: 0 },
        "registrations.student": { $ne: req.id },
      },
      {
        $push: { registrations: { student: req.id, registeredAt: now } },
        $inc: { seatsLeft: -1 },
      },
      { new: true, runValidators: true }
    ).populate("company", "name logo");

    if (!event) {
      const existingEvent = await Event.findById(req.params.id);
      if (!existingEvent) {
        return res.status(404).json({ success: false, message: "Event not found." });
      }
      if (existingEvent.registrations.some((registration) => registration.student.toString() === req.id)) {
        return res.status(409).json({ success: false, message: "You are already registered for this event." });
      }
      if (existingEvent.eventDate <= now || existingEvent.registrationDeadline <= now) {
        return res.status(400).json({ success: false, message: "Registration for this event is closed." });
      }
      return res.status(409).json({ success: false, message: "This event has no seats remaining." });
    }

    return res.status(201).json({
      success: true,
      message: "You are registered for this event.",
      event: serializeEvent(event),
    });
  } catch (error) {
    console.error("Event registration failed:", error);
    return res.status(500).json({ success: false, message: "Unable to register for this event." });
  }
};

// Get Single Event
export const getEventById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid event ID." });
    }
    const event = await Event.findById(req.params.id).populate("company", "name logo");

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    return res.status(200).json({
      success: true,
      event: serializeEvent(event),
    });
  } catch (error) {
    console.error("Event detail lookup failed:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load event details.",
    });
  }
};

// Update Event
export const updateEvent = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid event ID." });
    }
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

    const validation = validateEventPayload(req.body);
    if (validation.error) {
      return res.status(400).json({ success: false, message: validation.error });
    }

    const company = await getOwnedCompany(validation.value.companyId, req.id);
    if (!company) {
      return res.status(404).json({ success: false, message: "Select one of your companies." });
    }
    const { companyId, totalSeats, ...eventData } = validation.value;
    const updatedEvent = await Event.findOneAndUpdate(
      {
        _id: req.params.id,
        createdBy: req.id,
        $expr: {
          $lte: [
            { $size: { $ifNull: ["$registrations", []] } },
            totalSeats,
          ],
        },
      },
      {
        $set: {
          ...eventData,
          company: company._id,
          organizer: company.name,
          totalSeats,
        },
        $inc: { seatsLeft: totalSeats - event.totalSeats },
      },
      { new: true, runValidators: true }
    ).populate("company", "name logo");

    if (!updatedEvent) {
      return res.status(409).json({
        success: false,
        message: "Total seats cannot be fewer than current registrations.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Event updated successfully",
      event: serializeEvent(updatedEvent),
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
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid event ID." });
    }
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