const express = require("express");

const {
    getOverview,
    getEventAnalytics,
    getSingleEventAnalytics
} = require("../controllers/dashboardController");

const verifyToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Overall organizer dashboard
router.get(
    "/overview",
    verifyToken,
    authorizeRoles("ORGANIZER"),
    getOverview
);

// Analytics for all organizer events
router.get(
    "/events",
    verifyToken,
    authorizeRoles("ORGANIZER"),
    getEventAnalytics
);

// Analytics for one specific event
router.get(
    "/events/:eventId",
    verifyToken,
    authorizeRoles("ORGANIZER"),
    getSingleEventAnalytics
);

module.exports = router;