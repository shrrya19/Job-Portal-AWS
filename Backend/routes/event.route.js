import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import authorizeRole from "../middlewares/authorizeRole.js";

import {
  createEvent,
  getAllEvents,
  getAdminEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from "../controllers/event.controller.js";

const router = express.Router();

// Get All Events
router.get("/", getAllEvents);

router.get("/admin", isAuthenticated, authorizeRole("recruiter"), getAdminEvents);

// Create Event
router.post("/", isAuthenticated, authorizeRole("recruiter"), createEvent);

// Get Single Event
router.get("/:id", getEventById);

// Update Event
router.put("/:id", isAuthenticated, authorizeRole("recruiter"), updateEvent);

// Delete Event
router.delete("/:id", isAuthenticated, authorizeRole("recruiter"), deleteEvent);

export default router;