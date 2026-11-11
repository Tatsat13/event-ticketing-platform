const eventService = require("../services/eventService");

const createEvent = async (req, res) => {
    try {
        const eventData = {
            ...req.body,
            organizerId: req.user.id
        };

        const event = await eventService.createEvent(eventData);

        res.status(201).json({
            success: true,
            message: "Event created successfully",
            event
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
const getMyEvents = async (req, res) => {
    try {
        const organizerId = req.user.id;

        const events = await eventService.getEventsByOrganizer(organizerId);

        res.status(200).json({
            success: true,
            count: events.length,
            events
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
const updateEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        const organizerId = req.user.id;

        const result = await eventService.updateEvent(
            eventId,
            organizerId,
            req.body
        );

        res.status(200).json({
            success: true,
            message: result.message
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
const cancelEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        const organizerId = req.user.id;

        const result = await eventService.cancelEvent(
            eventId,
            organizerId
        );

        res.status(200).json({
            success: true,
            message: result.message
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
const getPublishedEvents = async (req, res) => {
    try {
        const events = await eventService.getPublishedEvents();

        res.status(200).json({
            success: true,
            count: events.length,
            events
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
const publishEvent = async (req, res) => {
    try {
        const result = await eventService.publishEvent(
            req.params.id,
            req.user.id
        );

        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
module.exports = { createEvent,getMyEvents,updateEvent,cancelEvent,getPublishedEvents,publishEvent};