const dashboardRepository = require("../repositories/dashboardRepository");

// Overall organizer dashboard
const getOrganizerOverview = async (organizerId) => {
    const data = await dashboardRepository.getOrganizerOverview(organizerId);

    const ticketsSold = Number(data.totalTicketsSold);
    const checkedIn = Number(data.totalCheckedIn);

    return {
        totalEvents: Number(data.totalEvents),
        totalTicketsSold: ticketsSold,
        totalBookingValue: Number(data.totalBookingValue),
        totalCheckedIn: checkedIn,
        attendancePercentage: ticketsSold > 0
            ? Number(((checkedIn / ticketsSold) * 100).toFixed(2))
            : 0
    };
};

// Analytics for all organizer events
const getOrganizerEventAnalytics = async (organizerId) => {
    const events = await dashboardRepository.getOrganizerEventAnalytics(
        organizerId
    );

    return events.map((event) => {
        const ticketsSold = Number(event.ticketsSold);
        const checkedIn = Number(event.totalCheckedIn);

        return {
            ...event,
            totalCapacity: Number(event.totalCapacity),
            ticketsSold,
            remainingCapacity: Number(event.remainingCapacity),
            bookingValue: Number(event.bookingValue),
            totalCheckedIn: checkedIn,
            attendancePercentage: ticketsSold > 0
                ? Number(((checkedIn / ticketsSold) * 100).toFixed(2))
                : 0
        };
    });
};

// Analytics for one specific event
const getEventAnalytics = async (eventId, organizerId) => {
    if (!Number.isInteger(eventId) || eventId <= 0) {
        throw new Error("Invalid event ID");
    }

    const event = await dashboardRepository.getEventAnalytics(
        eventId,
        organizerId
    );

    if (!event) {
        throw new Error("Event not found or you are not authorized");
    }

    const ticketsSold = Number(event.ticketsSold);
    const checkedIn = Number(event.totalCheckedIn);

    return {
        ...event,
        totalCapacity: Number(event.totalCapacity),
        ticketsSold,
        remainingCapacity: Number(event.remainingCapacity),
        bookingValue: Number(event.bookingValue),
        confirmedBookings: Number(event.confirmedBookings),
        cancelledBookings: Number(event.cancelledBookings),
        totalCheckedIn: checkedIn,
        attendancePercentage: ticketsSold > 0
            ? Number(((checkedIn / ticketsSold) * 100).toFixed(2))
            : 0
    };
};

module.exports = {
    getOrganizerOverview,
    getOrganizerEventAnalytics,
    getEventAnalytics
};