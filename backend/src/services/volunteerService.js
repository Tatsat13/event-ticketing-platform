const volunteerRepository = require("../repositories/volunteerRepository");

const assignVolunteer = async (eventId, volunteerId, organizerId) => {
    // 1. Verify event ownership
    const event = await volunteerRepository.getEventByOrganizer(
        eventId,
        organizerId
    );

    if (!event) {
        throw new Error("Event not found or you are not authorized");
    }

    // 2. Verify volunteer exists and has VOLUNTEER role
    const volunteer = await volunteerRepository.getVolunteerById(
        volunteerId
    );

    if (!volunteer) {
        throw new Error("Volunteer not found");
    }

    // 3. Check whether assignment already exists
    const existingAssignment = await volunteerRepository.getAssignment(
        eventId,
        volunteerId
    );

    if (existingAssignment) {
        throw new Error("Volunteer is already assigned to this event");
    }

    // 4. Create assignment
    const assignmentId = await volunteerRepository.createAssignment(
        eventId,
        volunteerId
    );

    return {
        assignmentId,
        eventId: event.id,
        eventTitle: event.title,
        volunteerId: volunteer.id,
        volunteerName: volunteer.name
    };
};

const removeVolunteer = async (eventId, volunteerId, organizerId) => {
    // 1. Verify event ownership
    const event = await volunteerRepository.getEventByOrganizer(
        eventId,
        organizerId
    );

    if (!event) {
        throw new Error("Event not found or you are not authorized");
    }

    // 2. Check whether assignment exists
    const assignment = await volunteerRepository.getAssignment(
        eventId,
        volunteerId
    );

    if (!assignment) {
        throw new Error("Volunteer is not assigned to this event");
    }

    // 3. Remove assignment
    await volunteerRepository.removeAssignment(eventId, volunteerId);

    return {
        eventId,
        volunteerId,
        message: "Volunteer removed successfully"
    };
};

const getMyAssignedEvents = async (volunteerId) => {
    return await volunteerRepository.getEventsByVolunteer(volunteerId);
};

module.exports = {
    assignVolunteer,
    removeVolunteer,
    getMyAssignedEvents
};