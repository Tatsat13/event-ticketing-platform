const pool = require("../config/db");
const ticketTierRepository = require("../repositories/ticketTierRepository");

const createTicketTier = async (eventId, organizerId, tierData) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();
        // Validate ticket tier details
        const { name, price, capacity } = tierData;

        if (!name || !name.trim()) {
            throw new Error("Ticket tier name is required");
        }

        if (price === undefined || Number(price) < 0 || !Number.isFinite(Number(price))) {
            throw new Error("Ticket price must be a valid non-negative number");
        }

        if (!Number.isInteger(Number(capacity)) || Number(capacity) <= 0) {
            throw new Error("Ticket capacity must be a positive integer");
        }
        // Check event ownership and lock the event row
        const event = await ticketTierRepository.getEventForUpdate(
            connection,
            eventId,
            organizerId
        );

        if (!event) {
            throw new Error("Event not found or you are not authorized to manage it");
        }

        if (event.status !== "DRAFT") {
            throw new Error("Ticket tiers can only be managed for draft events");
        }
        // Get the capacity already allocated to existing ticket tiers
        const totalCapacity = await ticketTierRepository.getTotalTierCapacity(
            connection,
            eventId
        );

        // Check whether the new tier exceeds event capacity
        if (totalCapacity + Number(capacity) > event.capacity) {
            throw new Error(
                `Ticket tier capacity exceeds the remaining event capacity. Available capacity: ${event.capacity - totalCapacity}`
            );
        }
        // Create the ticket tier
        const tierId = await ticketTierRepository.createTicketTier(
            connection,
            eventId,
            {
                name: name.trim(),
                price: Number(price),
                capacity: Number(capacity)
            }
        );
        await connection.commit();
        return {
            id: tierId,
            eventId: Number(eventId),
            name: name.trim(),
            price: Number(price),
            capacity: Number(capacity),
            soldCount: 0
        };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};
const getTicketTiersByEvent = async (eventId) => {
    return await ticketTierRepository.getTicketTiersByEvent(eventId);
};
const getEventStatus = async (eventId) => {
    return await ticketTierRepository.getEventStatus(eventId);
};
module.exports = {createTicketTier,getTicketTiersByEvent,getEventStatus};