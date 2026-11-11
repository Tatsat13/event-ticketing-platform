
const bookingService = require("../services/bookingService");

const createBooking = async (req, res) => {
    try {
        const userId = req.user.id;

        const { tierId, quantity } = req.body;

        // Read idempotency key from request header
        const idempotencyKey = req.get("Idempotency-Key");

        const booking = await bookingService.createBooking(
            userId,
            tierId,
            quantity,
            idempotencyKey
        );

        return res.status(201).json({
            success: true,
            message: "Booking created successfully",
            booking
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const getMyBookings = async (req, res) => {
    try {
        const userId = req.user.id;

        const bookings = await bookingService.getMyBookings(userId);

        return res.status(200).json({
            success: true,
            count: bookings.length,
            bookings
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
const cancelMyBooking = async (req, res) => {
    try {
        const bookingId = req.params.bookingId;
        const userId = req.user.id;

        const result = await bookingService.cancelMyBooking(
            bookingId,
            userId
        );

        return res.status(200).json({
            success: true,
            message: "Booking cancelled successfully",
            result
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
module.exports = {
    createBooking,
    getMyBookings,
    cancelMyBooking
};
