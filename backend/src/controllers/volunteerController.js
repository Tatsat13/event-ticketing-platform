const volunteerService = require("../services/volunteerService");

// Assign a volunteer to an event
const assignVolunteer = async (req, res) => {
    try {
        const { eventId, volunteerId } = req.body;
        const organizerId = req.user.id;

        const assignment = await volunteerService.assignVolunteer(
            eventId,
            volunteerId,
            organizerId
        );

        return res.status(201).json({
            success: true,
            message: "Volunteer assigned successfully",
            assignment
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Remove a volunteer from an event
const removeVolunteer = async (req, res) => {
    try {
        const { eventId, volunteerId } = req.params;
        const organizerId = req.user.id;

        const result = await volunteerService.removeVolunteer(
            eventId,
            volunteerId,
            organizerId
        );

        return res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get events assigned to the logged-in volunteer
const getMyAssignedEvents = async (req, res) => {
    try {
        const volunteerId = req.user.id;

        const events = await volunteerService.getMyAssignedEvents(
            volunteerId
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

module.exports = {
    assignVolunteer,
    removeVolunteer,
    getMyAssignedEvents
};