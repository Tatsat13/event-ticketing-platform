const pool = require("../config/db");
const checkInRepository = require("../repositories/checkInRepository");

const checkInTicket = async (qrToken, volunteerId) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Find and lock the ticket
        const ticket = await checkInRepository.getTicketByQRToken(
            connection,
            qrToken
        );

        if (!ticket) {
            throw new Error("Invalid QR code");
        }

        // 2. Verify booking status
        if (ticket.bookingStatus !== "CONFIRMED") {
            throw new Error("This booking is not confirmed");
        }

        // 3. Verify ticket status
        if (ticket.ticketStatus !== "VALID") {
            throw new Error("This ticket has already been used or cancelled");
        }

        // 4. Verify volunteer assignment
        const assignment = await checkInRepository.getVolunteerAssignment(
            connection,
            ticket.eventId,
            volunteerId
        );

        if (!assignment) {
            throw new Error("You are not assigned to this event");
        }

        // 5. Mark ticket as checked in
        const updatedRows = await checkInRepository.markTicketAsCheckedIn(
            connection,
            ticket.ticketId
        );

        if (updatedRows !== 1) {
            throw new Error("Ticket could not be checked in");
        }

        // 6. Create check-in record
        const checkInId = await checkInRepository.createCheckInRecord(
            connection,
            ticket.ticketId,
            volunteerId
        );

        // 7. Commit transaction
        await connection.commit();

        return {
            checkInId,
            ticketId: ticket.ticketId,
            eventId: ticket.eventId,
            eventTitle: ticket.eventTitle,
            status: "CHECKED_IN",
            message: "Ticket checked in successfully"
        };

    } catch (error) {
        await connection.rollback();
        throw error;

    } finally {
        connection.release();
    }
};

module.exports = {
    checkInTicket
};