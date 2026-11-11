const pool = require("../config/db");

// Get overall analytics for an organizer
const getOrganizerOverview = async (organizerId) => {
    const [rows] = await pool.execute(
        `SELECT
            COUNT(DISTINCT e.id) AS totalEvents,

            COALESCE(SUM(
                CASE
                    WHEN b.status = 'CONFIRMED'
                    THEN b.quantity
                    ELSE 0
                END
            ), 0) AS totalTicketsSold,

            COALESCE(SUM(
                CASE
                    WHEN b.status = 'CONFIRMED'
                    THEN b.quantity * t.price
                    ELSE 0
                END
            ), 0) AS totalBookingValue,

            (
                SELECT COUNT(*)
                FROM tickets tk
                JOIN bookings cb ON tk.booking_id = cb.id
                JOIN events ce ON cb.event_id = ce.id
                WHERE ce.organizer_id = ?
                  AND cb.status = 'CONFIRMED'
                  AND tk.status = 'CHECKED_IN'
            ) AS totalCheckedIn

         FROM events e
         LEFT JOIN bookings b ON b.event_id = e.id
         LEFT JOIN ticket_tiers t ON t.id = b.tier_id

         WHERE e.organizer_id = ?`,
        [organizerId, organizerId]
    );

    return rows[0];
};
// Get analytics for all events of an organizer
const getOrganizerEventAnalytics = async (organizerId) => {
    const [rows] = await pool.execute(
        `SELECT
            e.id AS eventId,
            e.title AS eventTitle,
            e.status AS eventStatus,
            e.capacity AS totalCapacity,

            COALESCE(SUM(
                CASE
                    WHEN b.status = 'CONFIRMED'
                    THEN b.quantity
                    ELSE 0
                END
            ), 0) AS ticketsSold,

            e.capacity - COALESCE(SUM(
                CASE
                    WHEN b.status = 'CONFIRMED'
                    THEN b.quantity
                    ELSE 0
                END
            ), 0) AS remainingCapacity,

            COALESCE(SUM(
                CASE
                    WHEN b.status = 'CONFIRMED'
                    THEN b.quantity * t.price
                    ELSE 0
                END
            ), 0) AS bookingValue,

            (
                SELECT COUNT(*)
                FROM tickets tk
                JOIN bookings cb ON tk.booking_id = cb.id
                WHERE cb.event_id = e.id
                  AND cb.status = 'CONFIRMED'
                  AND tk.status = 'CHECKED_IN'
            ) AS totalCheckedIn

         FROM events e
         LEFT JOIN bookings b ON b.event_id = e.id
         LEFT JOIN ticket_tiers t ON t.id = b.tier_id

         WHERE e.organizer_id = ?

         GROUP BY e.id, e.title, e.status, e.capacity
         ORDER BY e.created_at DESC`,
        [organizerId]
    );

    return rows;
};
// Get analytics for one specific event
const getEventAnalytics = async (eventId, organizerId) => {
    const [rows] = await pool.execute(
        `SELECT
            e.id AS eventId,
            e.title AS eventTitle,
            e.description,
            e.venue,
            e.start_time AS startTime,
            e.end_time AS endTime,
            e.status AS eventStatus,
            e.capacity AS totalCapacity,

            COALESCE(SUM(
                CASE
                    WHEN b.status = 'CONFIRMED'
                    THEN b.quantity
                    ELSE 0
                END
            ), 0) AS ticketsSold,

            e.capacity - COALESCE(SUM(
                CASE
                    WHEN b.status = 'CONFIRMED'
                    THEN b.quantity
                    ELSE 0
                END
            ), 0) AS remainingCapacity,

            COALESCE(SUM(
                CASE
                    WHEN b.status = 'CONFIRMED'
                    THEN b.quantity * t.price
                    ELSE 0
                END
            ), 0) AS bookingValue,

            COUNT(DISTINCT CASE
                WHEN b.status = 'CONFIRMED' THEN b.id
            END) AS confirmedBookings,

            COUNT(DISTINCT CASE
                WHEN b.status = 'CANCELLED' THEN b.id
            END) AS cancelledBookings,

            (
                SELECT COUNT(*)
                FROM tickets tk
                JOIN bookings cb ON tk.booking_id = cb.id
                WHERE cb.event_id = e.id
                  AND cb.status = 'CONFIRMED'
                  AND tk.status = 'CHECKED_IN'
            ) AS totalCheckedIn

         FROM events e
         LEFT JOIN bookings b ON b.event_id = e.id
         LEFT JOIN ticket_tiers t ON t.id = b.tier_id

         WHERE e.id = ? AND e.organizer_id = ?

         GROUP BY
            e.id, e.title, e.description, e.venue,
            e.start_time, e.end_time, e.status, e.capacity`,
        [eventId, organizerId]
    );

    return rows[0];
};
module.exports = {
    getOrganizerOverview,
    getOrganizerEventAnalytics,
    getEventAnalytics
};