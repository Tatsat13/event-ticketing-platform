const ticketRepository = require("../repositories/ticketRepository");

const getTicketById = async (ticketId, userId) => {
    const ticket = await ticketRepository.getTicketById(
        ticketId,
        userId
    );

    if (!ticket) {
        throw new Error("Ticket not found");
    }

    if (ticket.bookingStatus !== "CONFIRMED") {
        throw new Error("This booking is not confirmed");
    }

    return ticket;
};

module.exports = {
    getTicketById
};