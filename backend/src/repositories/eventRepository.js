const pool = require("../config/db");

const createEvent = async (eventData) => {
    const {
        organizerId,
        title,
        description,
        venue,
        startTime,
        endTime,
        capacity
    } = eventData;

    const [result] = await pool.execute(
        `INSERT INTO events
        (organizer_id, title, description, venue, start_time, end_time, capacity)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            organizerId,
            title,
            description,
            venue,
            startTime,
            endTime,
            capacity
        ]
    );

    return result.insertId;
};
const getEventsByOrganizer = async (organizerId) => {
    const [rows] = await pool.execute(
        `SELECT * FROM events
         WHERE organizer_id = ?
         ORDER BY created_at DESC`,
        [organizerId]
    );

    return rows;
};
const updateEvent = async (eventId, organizerId, eventData) => {
    const {
        title,
        description,
        venue,
        startTime,
        endTime,
        capacity
    } = eventData;

    const [result] = await pool.execute(
        `UPDATE events
         SET title = ?,
             description = ?,
             venue = ?,
             start_time = ?,
             end_time = ?,
             capacity = ?
         WHERE id = ? AND organizer_id = ?`,
        [
            title,
            description,
            venue,
            startTime,
            endTime,
            capacity,
            eventId,
            organizerId
        ]
    );

    return result.affectedRows;
};
const cancelEvent = async (eventId, organizerId) => {
    const [result] = await pool.execute(
        `UPDATE events
         SET status = 'CANCELLED'
         WHERE id = ? AND organizer_id = ?
         AND status != 'CANCELLED'`,
        [eventId, organizerId]
    );

    return result.affectedRows;
};
const getPublishedEvents = async () => {
    const [rows] = await pool.execute(
        `SELECT id, title, description, venue,
                start_time, end_time, capacity, created_at
         FROM events
         WHERE status = 'PUBLISHED'
         ORDER BY start_time ASC`
    );

    return rows;
};
const hasTicketTiers = async (eventId) => {
    const [rows] = await pool.execute(
        `SELECT id FROM ticket_tiers
         WHERE event_id = ?
         LIMIT 1`,
        [eventId]
    );

    return rows.length > 0;
};
const publishEvent = async (eventId, organizerId) => {
    const [result] = await pool.execute(
        `UPDATE events
         SET status = 'PUBLISHED'
         WHERE id = ?
         AND organizer_id = ?
         AND status = 'DRAFT'`,
        [eventId, organizerId]
    );

    return result.affectedRows;
};
module.exports = { createEvent,getEventsByOrganizer,updateEvent,cancelEvent,getPublishedEvents,hasTicketTiers,publishEvent};