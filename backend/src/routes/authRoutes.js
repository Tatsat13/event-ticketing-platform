const express = require("express");
const {registerUser,loginUser,getCurrentUser} = require("../controllers/authController");
const verifyToken = require("../middleware/authMiddleware")
const router = express.Router();

// Registration
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Get currently logged-in user (Protected)
router.get("/me", verifyToken, getCurrentUser);

module.exports = router;