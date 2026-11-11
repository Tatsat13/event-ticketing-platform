const pool = require("../config/db");

// Find ticket using its QR token
const getTicketByQRToken = async (connection, qrToken) => {
    const [rows] = await connection.execute(
        `SELECT
            tk.id AS ticketId,
            tk.booking_id AS bookingId,
            tk.status AS ticketStatus,
            b.user_id AS userId,
            b.event_id AS eventId,
            b.status AS bookingStatus,
            e.title AS eventTitle
         FROM tickets tk
         JOIN bookings b ON tk.booking_id = b.id
         JOIN events e ON b.event_id = e.id
         WHERE tk.qr_token = ?
         FOR UPDATE`,
        [qrToken]
    );

    return rows[0];
};
// Check whether volunteer is assigned to the event
const getVolunteerAssignment = async (connection, eventId, volunteerId) => {
    const [rows] = await connection.execute(
        `SELECT id
         FROM volunteer_assignments
         WHERE event_id = ? AND volunteer_id = ?`,
        [eventId, volunteerId]
    );

    return rows[0];
};
// Mark ticket as checked in
const markTicketAsCheckedIn = async (connection, ticketId) => {
    const [result] = await connection.execute(
        `UPDATE tickets
         SET status = 'CHECKED_IN'
         WHERE id = ? AND status = 'VALID'`,
        [ticketId]
    );

    return result.affectedRows;
};
// Create check-in record
const createCheckInRecord = async (connection, ticketId, volunteerId) => {
    const [result] = await connection.execute(
        `INSERT INTO check_ins (ticket_id, volunteer_id)
         VALUES (?, ?)`,
        [ticketId, volunteerId]
    );

    return result.insertId;
};
module.exports = {
    getTicketByQRToken,
    getVolunteerAssignment,
    markTicketAsCheckedIn,
    createCheckInRecord
}; 