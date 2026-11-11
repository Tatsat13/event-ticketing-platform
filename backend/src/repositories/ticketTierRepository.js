const pool = require("../config/db");

const getEventForUpdate = async (connection, eventId, organizerId) => {
    const [rows] = await connection.execute(
        `SELECT id, capacity, status
         FROM events
         WHERE id = ? AND organizer_id = ?
         FOR UPDATE`,
        [eventId, organizerId]
    );

    return rows[0];
};

const getTotalTierCapacity = async (connection, eventId) => {
    const [rows] = await connection.execute(
        `SELECT COALESCE(SUM(capacity), 0) AS totalCapacity
         FROM ticket_tiers
         WHERE event_id = ?`,
        [eventId]
    );

    return Number(rows[0].totalCapacity);
};
const createTicketTier = async (connection, eventId, tierData) => {
    const { name, price, capacity } = tierData;

    const [result] = await connection.execute(
        `INSERT INTO ticket_tiers
         (event_id, name, price, capacity)
         VALUES (?, ?, ?, ?)`,
        [eventId, name, price, capacity]
    );

    return result.insertId;
};
const getTicketTiersByEvent = async (eventId) => {
    const [rows] = await pool.execute(
        `SELECT id, event_id, name, price, capacity, sold_count
         FROM ticket_tiers
         WHERE event_id = ?
         ORDER BY price ASC`,
        [eventId]
    );

    return rows;
};
const getEventStatus = async (eventId) => {
    const [rows] = await pool.execute(
        `SELECT id, status
         FROM events
         WHERE id = ?`,
        [eventId]
    );

    return rows[0];
};
module.exports = {
    getEventForUpdate,
    getTotalTierCapacity,
    createTicketTier,
    getTicketTiersByEvent,
    getEventStatus
};