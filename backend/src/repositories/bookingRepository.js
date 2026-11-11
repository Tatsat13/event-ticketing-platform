const pool = require("../config/db");

const getTicketTierForUpdate = async (connection, tierId) => {
    const [rows] = await connection.execute(
        `SELECT
        t.id,
        t.event_id,
        t.name,
        t.price,
        t.capacity,
        t.sold_count,
        e.status AS event_status
        FROM ticket_tiers t
        JOIN events e ON t.event_id = e.id
        WHERE t.id = ?
        FOR UPDATE`,
        [tierId]
    );

    return rows[0];
};
const updateTierSoldCount = async (connection, tierId, quantity) => {
    const [result] = await connection.execute(
        `UPDATE ticket_tiers
         SET sold_count = sold_count + ?
         WHERE id = ?`,
        [quantity, tierId]
    );

    return result.affectedRows;
};


const createBooking = async (
    connection,
    userId,
    eventId,
    tierId,
    quantity,
    idempotencyKey
) => {
    const [result] = await connection.execute(
        `INSERT INTO bookings
         (user_id, event_id, tier_id, quantity, status, idempotency_key)
         VALUES (?, ?, ?, ?, 'CONFIRMED', ?)`,
        [userId, eventId, tierId, quantity, idempotencyKey]
    );

    return result.insertId;
};

const getBookingByIdempotencyKey = async (
    connection,
    userId,
    idempotencyKey
) => {
    const [rows] = await connection.execute(
        `SELECT
    b.id,
    b.user_id,
    b.event_id,
    b.tier_id,
    b.quantity,
    b.status,
    t.name AS tierName
FROM bookings b
JOIN ticket_tiers t ON b.tier_id = t.id
WHERE b.user_id = ? AND b.idempotency_key = ?`,
        [userId, idempotencyKey]
    );

    return rows[0];
};

const createTicket = async (connection, bookingId, qrToken) => {
    const [result] = await connection.execute(
        `INSERT INTO tickets (booking_id, qr_token)
         VALUES (?, ?)`,
        [bookingId, qrToken]
    );

    return result.insertId;
};
const getBookingTickets = async (connection, bookingId) => {
    const [rows] = await connection.execute(
        `SELECT id AS ticketId, qr_token AS qrToken
         FROM tickets
         WHERE booking_id = ?
         ORDER BY id ASC`,
        [bookingId]
    );

    return rows;
};
const getBookingsByUser = async (userId) => {
    const [rows] = await pool.execute(
        `SELECT
            b.id AS bookingId,
            b.event_id AS eventId,
            b.tier_id AS tierId,
            b.quantity,
            b.status AS bookingStatus,
            b.created_at AS bookingDate,

            e.title AS eventTitle,
            e.venue,
            e.start_time AS startTime,
            e.end_time AS endTime,

            t.name AS tierName,
            t.price AS ticketPrice,

            tk.id AS ticketId,
            tk.status AS ticketStatus

        FROM bookings b
        JOIN events e ON b.event_id = e.id
        JOIN ticket_tiers t ON b.tier_id = t.id
        LEFT JOIN tickets tk ON b.id = tk.booking_id

        WHERE b.user_id = ?
        ORDER BY b.created_at DESC, tk.id ASC`,
        [userId]
    );

    return rows;
};
// Get a booking and lock its row
const getBookingForUpdate = async (connection, bookingId, userId) => {
    const [rows] = await connection.execute(
        `SELECT id, user_id, tier_id, quantity, status
         FROM bookings
         WHERE id = ? AND user_id = ?
         FOR UPDATE`,
        [bookingId, userId]
    );

    return rows[0];
};

// Get and lock all tickets belonging to a booking
const getBookingTicketStatuses = async (connection, bookingId) => {
    const [rows] = await connection.execute(
        `SELECT id, status
         FROM tickets
         WHERE booking_id = ?
         FOR UPDATE`,
        [bookingId]
    );

    return rows;
};

// Mark the booking as cancelled
const cancelBooking = async (connection, bookingId) => {
    const [result] = await connection.execute(
        `UPDATE bookings
         SET status = 'CANCELLED'
         WHERE id = ? AND status = 'CONFIRMED'`,
        [bookingId]
    );

    return result.affectedRows;
};

// Restore the available ticket count
const decreaseTierSoldCount = async (connection, tierId, quantity) => {
    const [result] = await connection.execute(
        `UPDATE ticket_tiers
         SET sold_count = sold_count - ?
         WHERE id = ? AND sold_count >= ?`,
        [quantity, tierId, quantity]
    );

    return result.affectedRows;
};
const cancelBookingTickets = async (connection, bookingId) => {
    const [result] = await connection.execute(
        `UPDATE tickets
         SET status = 'CANCELLED'
         WHERE booking_id = ? AND status = 'VALID'`,
        [bookingId]
    );

    return result.affectedRows;
};
module.exports = {
    getTicketTierForUpdate,
    updateTierSoldCount,
    createBooking,
    createTicket,
    getBookingByIdempotencyKey,
    getBookingTickets,
    getBookingsByUser,
    getBookingForUpdate,
    getBookingTicketStatuses,
    cancelBooking,
    decreaseTierSoldCount,
    cancelBookingTickets
};