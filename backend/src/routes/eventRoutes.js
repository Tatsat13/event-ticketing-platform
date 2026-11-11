const express = require("express");

const { createEvent,getMyEvents,updateEvent,cancelEvent,getPublishedEvents,publishEvent} = require("../controllers/eventController");
const verifyToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const {createTicketTier,getTicketTiersByEvent} = require("../controllers/ticketTierController");
const router = express.Router();

// Create event (Organizer only)
router.post("/", verifyToken, authorizeRoles("ORGANIZER"), createEvent);
// Get events belonging to the logged-in organizer
router.get("/my-events", verifyToken, authorizeRoles("ORGANIZER"), getMyEvents);
// Update an existing event (Organizer only)
router.put("/:id", verifyToken, authorizeRoles("ORGANIZER"), updateEvent);
// Cancel event (Soft Delete - Organizer only)
router.delete("/:id", verifyToken, authorizeRoles("ORGANIZER"), cancelEvent);
// Public route - Get all published events
router.get("/", getPublishedEvents);
// Publish an event (Organizer only)
router.patch("/:id/publish",verifyToken,authorizeRoles("ORGANIZER"),publishEvent);
// Create a ticket tier for an event (Organizer only)
router.post("/:eventId/tiers",verifyToken,authorizeRoles("ORGANIZER"),createTicketTier);
// Public route - Get ticket tiers of a published event
router.get("/:eventId/tiers", getTicketTiersByEvent);
module.exports = router;