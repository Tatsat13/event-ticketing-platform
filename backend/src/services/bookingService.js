
const pool = require("../config/db");
const crypto = require("crypto");
const bookingRepository = require("../repositories/bookingRepository");

const createBooking = async (
    userId,
    tierId,
    quantity,
    idempotencyKey
) => {
    // Validate idempotency key
    if (
        typeof idempotencyKey !== "string" ||
        !idempotencyKey.trim() ||
        idempotencyKey.length > 100
    ) {
        throw new Error("A valid idempotency key is required");
    }

    // Validate quantity
    quantity = Number(quantity);

    if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new Error("Booking quantity must be a positive integer");
    }

    const connection = await pool.getConnection();
    let transactionStarted = false;

    try {
        await connection.beginTransaction();
        transactionStarted = true;

        // 1. Check whether this request was already completed
        const existingBooking =
            await bookingRepository.getBookingByIdempotencyKey(
                connection,
                userId,
                idempotencyKey
            );

        if (existingBooking) {

            // Ensure the key is not being reused for different details
            if (
                Number(existingBooking.tier_id) !== Number(tierId) ||
                Number(existingBooking.quantity) !== quantity
            ) {
                throw new Error(
                    "This idempotency key has already been used for a different booking"
                );
            }

            const tickets = await bookingRepository.getBookingTickets(
                connection,
                existingBooking.id
            );

            await connection.commit();
            transactionStarted = false;

            return {
                bookingId: existingBooking.id,
                eventId: existingBooking.event_id,
                tierId: existingBooking.tier_id,
                tierName: existingBooking.tierName,
                quantity: existingBooking.quantity,
                status: existingBooking.status,
                tickets
            };
        }

        // 2. Lock and retrieve ticket tier
        const tier = await bookingRepository.getTicketTierForUpdate(
            connection,
            tierId
        );

        if (!tier) {
            throw new Error("Ticket tier not found");
        }

        // 3. Check event status
        if (tier.event_status !== "PUBLISHED") {
            throw new Error("Tickets are not available for this event");
        }

        // 4. Check available capacity
        const availableTickets = tier.capacity - tier.sold_count;

        if (quantity > availableTickets) {
            throw new Error(
                `Only ${availableTickets} tickets are available`
            );
        }

        // 5. Update sold count
        await bookingRepository.updateTierSoldCount(
            connection,
            tier.id,
            quantity
        );

        // 6. Create booking with idempotency key
        const bookingId = await bookingRepository.createBooking(
            connection,
            userId,
            tier.event_id,
            tier.id,
            quantity,
            idempotencyKey
        );

        // 7. Generate individual tickets
        const tickets = [];

        for (let i = 0; i < quantity; i++) {
            const qrToken = crypto.randomBytes(32).toString("hex");

            const ticketId = await bookingRepository.createTicket(
                connection,
                bookingId,
                qrToken
            );

            tickets.push({
                ticketId,
                qrToken
            });
        }

        // 8. Commit transaction
        await connection.commit();
        transactionStarted = false;

        return {
            bookingId,
            eventId: tier.event_id,
            tierId: tier.id,
            tierName: tier.name,
            quantity,
            status: "CONFIRMED",
            tickets
        };

    } catch (error) {

        if (transactionStarted) {
            await connection.rollback();
            transactionStarted = false;
        }

        // Handle simultaneous requests using the same key
        if (error.code === "ER_DUP_ENTRY") {

            const existingBooking =
                await bookingRepository.getBookingByIdempotencyKey(
                    connection,
                    userId,
                    idempotencyKey
                );

            if (existingBooking) {

                if (
                    Number(existingBooking.tier_id) !== Number(tierId) ||
                    Number(existingBooking.quantity) !== quantity
                ) {
                    throw new Error(
                        "This idempotency key has already been used for a different booking"
                    );
                }

                const tickets = await bookingRepository.getBookingTickets(
                    connection,
                    existingBooking.id
                );

                return {
                    bookingId: existingBooking.id,
                    eventId: existingBooking.event_id,
                    tierId: existingBooking.tier_id,
                    tierName: existingBooking.tierName,
                    quantity: existingBooking.quantity,
                    status: existingBooking.status,
                    tickets
                };
            }
        }

        throw error;

    } finally {
        connection.release();
    }
};

const getMyBookings = async (userId) => {
    const bookings = await bookingRepository.getBookingsByUser(userId);

    // Group individual tickets under their respective bookings
    const bookingMap = new Map();

    for (const row of bookings) {
        if (!bookingMap.has(row.bookingId)) {
            bookingMap.set(row.bookingId, {
                bookingId: row.bookingId,
                eventId: row.eventId,
                eventTitle: row.eventTitle,
                venue: row.venue,
                startTime: row.startTime,
                endTime: row.endTime,
                tierId: row.tierId,
                tierName: row.tierName,
                ticketPrice: row.ticketPrice,
                quantity: row.quantity,
                bookingStatus: row.bookingStatus,
                bookingDate: row.bookingDate,
                tickets: []
            });
        }

        // Add ticket only if it exists
        if (row.ticketId !== null) {
            bookingMap.get(row.bookingId).tickets.push({
                ticketId: row.ticketId,
                ticketStatus: row.ticketStatus
            });
        }
    }

    return Array.from(bookingMap.values());
};
const cancelMyBooking = async (bookingId, userId) => {
    const connection = await pool.getConnection();
    let transactionStarted = false;

    try {
        await connection.beginTransaction();
        transactionStarted = true;

        // 1. Find and lock the booking
        const booking = await bookingRepository.getBookingForUpdate(
            connection,
            bookingId,
            userId
        );

        if (!booking) {
            throw new Error("Booking not found");
        }

        if (booking.status !== "CONFIRMED") {
            throw new Error("This booking cannot be cancelled");
        }

        // 2. Get and lock all tickets
        const tickets = await bookingRepository.getBookingTicketStatuses(
            connection,
            bookingId
        );

        if (tickets.length !== Number(booking.quantity)) {
            throw new Error("Booking ticket records are inconsistent");
        }

        // 3. Prevent cancellation if any ticket was already checked in
        if (tickets.some(ticket => ticket.status === "CHECKED_IN")) {
            throw new Error("Cannot cancel a booking with checked-in tickets");
        }

        if (tickets.some(ticket => ticket.status !== "VALID")) {
            throw new Error("Some tickets cannot be cancelled");
        }

        // 4. Cancel the booking
        const bookingUpdated = await bookingRepository.cancelBooking(
            connection,
            bookingId
        );

        if (bookingUpdated !== 1) {
            throw new Error("Booking cancellation failed");
        }

        // 5. Cancel all individual tickets
        const cancelledTickets =
            await bookingRepository.cancelBookingTickets(
                connection,
                bookingId
            );

        if (cancelledTickets !== tickets.length) {
            throw new Error("Ticket cancellation failed");
        }

        // 6. Restore ticket availability
        const tierUpdated =
            await bookingRepository.decreaseTierSoldCount(
                connection,
                booking.tier_id,
                booking.quantity
            );

        if (tierUpdated !== 1) {
            throw new Error("Failed to restore ticket availability");
        }

        // 7. Commit all changes
        await connection.commit();
        transactionStarted = false;

        return {
            bookingId: booking.id,
            status: "CANCELLED",
            cancelledTickets: cancelledTickets
        };

    } catch (error) {
        if (transactionStarted) {
            await connection.rollback();
            transactionStarted = false;
        }

        throw error;

    } finally {
        connection.release();
    }
};

module.exports = {
    createBooking,
    getMyBookings,
    cancelMyBooking
};
