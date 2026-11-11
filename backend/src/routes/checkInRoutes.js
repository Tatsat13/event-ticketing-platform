const express = require("express");
const { checkInTicket } = require("../controllers/checkInController");
const verifyToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// POST /api/check-ins
router.post(
    "/",
    verifyToken,
    authorizeRoles("VOLUNTEER"),
    checkInTicket
);

module.exports = router;