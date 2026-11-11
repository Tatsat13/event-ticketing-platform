
const express = require("express");

const {createBooking,getMyBookings,cancelMyBooking} = require("../controllers/bookingController");

const verifyToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Create booking (Students only)
router.post(
    "/",
    verifyToken,
    authorizeRoles("STUDENT","ORGANIZER"),
    createBooking
);
// Get bookings of the logged-in user
router.get(
    "/my",
    verifyToken,
    authorizeRoles("STUDENT", "ORGANIZER"),
    getMyBookings
);
// Cancel a booking
router.patch(
    "/:bookingId/cancel",
    verifyToken,
    authorizeRoles("STUDENT", "ORGANIZER"),
    cancelMyBooking
);
module.exports = router;
