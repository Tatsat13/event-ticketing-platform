const dashboardService = require("../services/dashboardService");

// Get overall organizer dashboard
const getOverview = async (req, res) => {
    try {
        const organizerId = req.user.id;

        const data = await dashboardService.getOrganizerOverview(organizerId);

        return res.status(200).json({
            success: true,
            data
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get analytics for all organizer events
const getEventAnalytics = async (req, res) => {
    try {
        const organizerId = req.user.id;

        const events = await dashboardService.getOrganizerEventAnalytics(
            organizerId
        );

        return res.status(200).json({
            success: true,
            count: events.length,
            events
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get analytics for one specific event
const getSingleEventAnalytics = async (req, res) => {
    try {
        const organizerId = req.user.id;
        const eventId = Number(req.params.eventId);

        const data = await dashboardService.getEventAnalytics(
            eventId,
            organizerId
        );

        return res.status(200).json({
            success: true,
            data
        });

    } catch (error) {
        const statusCode = error.message === "Invalid event ID" ? 400 :
            error.message === "Event not found or you are not authorized" ? 404 :
            500;

        return res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getOverview,
    getEventAnalytics,
    getSingleEventAnalytics
};