const express = require("express");

const {
    getTicketById
} = require("../controllers/ticketController");

const verifyToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Get an individual ticket (Students and Organizers)
router.get(
    "/:ticketId",
    verifyToken,
    authorizeRoles("STUDENT", "ORGANIZER"),
    getTicketById
);

module.exports = router;