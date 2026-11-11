const ticketService = require("../services/ticketService");

const getTicketById = async (req, res) => {
    try {
        const ticketId = req.params.ticketId;
        const userId = req.user.id;

        const ticket = await ticketService.getTicketById(
            ticketId,
            userId
        );

        return res.status(200).json({
            success: true,
            ticket
        });
    } catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getTicketById
};