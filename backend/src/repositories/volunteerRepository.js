const pool = require("../config/db");

// Check whether the event belongs to the organizer
const getEventByOrganizer = async (eventId, organizerId) => {
    const [rows] = await pool.execute(
        `SELECT id, organizer_id, title
         FROM events
         WHERE id = ? AND organizer_id = ?`,
        [eventId, organizerId]
    );

    return rows[0];
};

// Find a user and verify their role
const getVolunteerById = async (volunteerId) => {
    const [rows] = await pool.execute(
        `SELECT id, name, email, role
         FROM users
         WHERE id = ? AND role = 'VOLUNTEER'`,
        [volunteerId]
    );

    return rows[0];
};

// Check whether the volunteer is already assigned
const getAssignment = async (eventId, volunteerId) => {
    const [rows] = await pool.execute(
        `SELECT id, event_id, volunteer_id
         FROM volunteer_assignments
         WHERE event_id = ? AND volunteer_id = ?`,
        [eventId, volunteerId]
    );

    return rows[0];
};

// Create a volunteer assignment
const createAssignment = async (eventId, volunteerId) => {
    const [result] = await pool.execute(
        `INSERT INTO volunteer_assignments
         (event_id, volunteer_id)
         VALUES (?, ?)`,
        [eventId, volunteerId]
    );

    return result.insertId;
};

// Remove a volunteer assignment
const removeAssignment = async (eventId, volunteerId) => {
    const [result] = await pool.execute(
        `DELETE FROM volunteer_assignments
         WHERE event_id = ? AND volunteer_id = ?`,
        [eventId, volunteerId]
    );

    return result.affectedRows;
};

// Get all events assigned to a volunteer
const getEventsByVolunteer = async (volunteerId) => {
    const [rows] = await pool.execute(
        `SELECT
            e.id AS eventId,
            e.title,
            e.description,
            e.venue,
            e.start_time AS startTime,
            e.end_time AS endTime,
            e.status
         FROM volunteer_assignments va
         JOIN events e ON va.event_id = e.id
         WHERE va.volunteer_id = ?
         ORDER BY e.start_time ASC`,
        [volunteerId]
    );

    return rows;
};

module.exports = {
    getEventByOrganizer,
    getVolunteerById,
    getAssignment,
    createAssignment,
    removeAssignment,
    getEventsByVolunteer
};