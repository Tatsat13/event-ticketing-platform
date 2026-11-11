const pool = require("../config/db");

const getTicketById = async (ticketId, userId) => {
    const [rows] = await pool.execute(
        `SELECT
            tk.id AS ticketId,
            tk.qr_token AS qrToken,
            tk.status AS ticketStatus,
            tk.created_at AS ticketCreatedAt,
            b.id AS bookingId,
            b.status AS bookingStatus,
            b.quantity,
            e.id AS eventId,
            e.title AS eventTitle,
            e.description,
            e.venue,
            e.start_time AS startTime,
            e.end_time AS endTime,
            t.id AS tierId,
            t.name AS tierName,
            t.price AS ticketPrice
        FROM tickets tk
        JOIN bookings b ON tk.booking_id = b.id
        JOIN events e ON b.event_id = e.id
        JOIN ticket_tiers t ON b.tier_id = t.id
        WHERE tk.id = ? AND b.user_id = ?`,
        [ticketId, userId]
    );

    return rows[0];
};

module.exports = {
    getTicketById
};