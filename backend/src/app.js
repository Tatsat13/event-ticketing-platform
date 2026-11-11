const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const app = express();
const eventRoutes = require("./routes/eventRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const volunteerRoutes = require("./routes/volunteerRoutes");
const checkInRoutes = require("./routes/checkInRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
// Middleware
app.use(cors({origin: "http://localhost:5173"}));

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/volunteers", volunteerRoutes);
app.use("/api/check-ins", checkInRoutes);
app.use("/api/dashboard", dashboardRoutes);
// Health check API
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Event Ticketing API is running!"
    });
});

module.exports = app;