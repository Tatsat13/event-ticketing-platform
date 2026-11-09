const authService = require("../services/authService");

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const user = await authService.registerUser(
            name,
            email,
            password
        );

        res.status(201).json({
            success: true,
            message: "User registered successfully!",
            data: user
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await authService.loginUser(
            email,
            password
        );

        res.status(200).json({
            success: true,
            message: "Login successful!",
            data: user
        });

    } catch (error) {
        res.status(401).json({
            success: false,
            message: error.message
        });
    }
};
const getCurrentUser = async (req, res) => {
    try {
        const userRepository = require("../repositories/userRepository");

        const user = await userRepository.findUserByEmail(
            req.user.email
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
module.exports = {
    registerUser,
    loginUser,
    getCurrentUser
};