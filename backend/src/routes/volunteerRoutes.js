const express = require("express");

const {
    assignVolunteer,
    removeVolunteer,
    getMyAssignedEvents
} = require("../controllers/volunteerController");

const verifyToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Assign a volunteer to an event (Organizer only)
router.post(
    "/assign",
    verifyToken,
    authorizeRoles("ORGANIZER"),
    assignVolunteer
);

// Remove a volunteer from an event (Organizer only)
router.delete(
    "/:eventId/:volunteerId",
    verifyToken,
    authorizeRoles("ORGANIZER"),
    removeVolunteer
);

// Get events assigned to the logged-in volunteer
router.get(
    "/my-events",
    verifyToken,
    authorizeRoles("VOLUNTEER"),
    getMyAssignedEvents
);

module.exports = router;