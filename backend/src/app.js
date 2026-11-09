const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const app = express();

// Middleware
app.use(cors({
    origin: "http://localhost:5173"
}));

app.use(express.json());
app.use("/api/auth", authRoutes);
// Health check API
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Event Ticketing API is running!"
    });
});

module.exports = app;