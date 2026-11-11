const eventRepository = require("../repositories/eventRepository");

const createEvent = async (eventData) => {
    const {
        capacity,
        startTime,
        endTime
    } = eventData;

    // 1. Validate event capacity
    if (!Number.isInteger(Number(capacity)) || Number(capacity) <= 0) {
        throw new Error("Event capacity must be a positive integer");
    }

    // 2. Validate event dates
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error("Invalid event date or time");
    }

    if (end <= start) {
        throw new Error("Event end time must be after start time");
    }

    // 3. Create event
    const eventId = await eventRepository.createEvent({
        ...eventData,
        capacity: Number(capacity)
    });

    return {
        id: eventId,
        ...eventData,
        capacity: Number(capacity),
        status: "DRAFT"
    };
};
const getEventsByOrganizer = async (organizerId) => {
    return await eventRepository.getEventsByOrganizer(organizerId);
};
const updateEvent = async (eventId, organizerId, eventData) => {
    const {
        title,
        venue,
        startTime,
        endTime,
        capacity
    } = eventData;

    // Validate required fields
    if (!title || !venue || !startTime || !endTime) {
        throw new Error("Title, venue, start time and end time are required");
    }

    // Validate capacity
    if (!Number.isInteger(Number(capacity)) || Number(capacity) <= 0) {
        throw new Error("Event capacity must be a positive integer");
    }

    // Validate dates
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error("Invalid event date or time");
    }

    if (end <= start) {
        throw new Error("Event end time must be after start time");
    }

    const affectedRows = await eventRepository.updateEvent(
        eventId,
        organizerId,
        {
            ...eventData,
            capacity: Number(capacity)
        }
    );

    if (affectedRows === 0) {
        throw new Error("Event not found or you are not authorized to update it");
    }

    return { message: "Event updated successfully" };
};
const cancelEvent = async (eventId, organizerId) => {
    const affectedRows = await eventRepository.cancelEvent(
        eventId,
        organizerId
    );

    if (affectedRows === 0) {
        throw new Error("Event not found, already cancelled, or you are not authorized");
    }

    return {
        message: "Event cancelled successfully"
    };
};
const getPublishedEvents = async () => {
    return await eventRepository.getPublishedEvents();
};
const publishEvent = async (eventId, organizerId) => {
    // Check whether the event has at least one ticket tier
    const hasTiers = await eventRepository.hasTicketTiers(eventId);

    if (!hasTiers) {
        throw new Error("Create at least one ticket tier before publishing the event");
    }

    // Publish the event
    const affectedRows = await eventRepository.publishEvent(eventId, organizerId);

    if (affectedRows === 0) {
        throw new Error("Event not found, already published, or you are not authorized");
    }

    return {
        message: "Event published successfully"
    };
};
module.exports = { createEvent,getEventsByOrganizer,updateEvent,cancelEvent,getPublishedEvents,publishEvent};