const checkInService = require("../services/checkInService");

const checkInTicket = async (req, res) => {
    try {
        const { qrToken } = req.body;
        const volunteerId = req.user.id;

        const result = await checkInService.checkInTicket(
            qrToken,
            volunteerId
        );

        return res.status(200).json({
            success: true,
            ...result
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    checkInTicket
};