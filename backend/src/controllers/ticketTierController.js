const ticketTierService = require("../services/ticketTierService");

const createTicketTier = async (req, res) => {
    try {
        const ticketTier = await ticketTierService.createTicketTier(
            req.params.eventId,
            req.user.id,
            req.body
        );

        res.status(201).json({
            success: true,
            message: "Ticket tier created successfully",
            ticketTier
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
const getTicketTiersByEvent = async (req, res) => {
    try {
        const event = await ticketTierService.getEventStatus(
            req.params.eventId
        );

        if (!event || event.status !== "PUBLISHED") {
            return res.status(404).json({
                success: false,
                message: "Published event not found"
            });
        }

        const ticketTiers = await ticketTierService.getTicketTiersByEvent(
            req.params.eventId
        );

        res.status(200).json({
            success: true,
            count: ticketTiers.length,
            ticketTiers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
module.exports = {
    createTicketTier,
    getTicketTiersByEvent
};