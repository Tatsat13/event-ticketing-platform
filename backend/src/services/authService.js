const bcrypt = require("bcryptjs");
const userRepository = require("../repositories/userRepository");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const registerUser = async (name, email, password) => {

    // 1. Check whether email already exists
    const existingUser = await userRepository.findUserByEmail(email);

    if (existingUser) {
        throw new Error("Email already registered");
    }

    // 2. Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // 3. Create user in database
    const userId = await userRepository.createUser(
        name,
        email,
        passwordHash,
        "STUDENT"
    );

    return {
        id: userId,
        name,
        email,
        role: "STUDENT"
    };
};

const loginUser = async (email, password) => {

    // 1. Find user by email
    const user = await userRepository.findUserByEmail(email);

    if (!user) {
        throw new Error("Invalid email or password");
    }

    // 2. Compare entered password with stored hash
    const isPasswordValid = await bcrypt.compare(
        password,
        user.password_hash
    );

    if (!isPasswordValid) {
        throw new Error("Invalid email or password");
    }

    
    // 3. Generate JWT token
    const token = jwt.sign(
    {
        id: user.id,
        email:user.email,
        role: user.role
    },
    process.env.JWT_SECRET,
    {
        expiresIn: "1d"
    }
);

// 4. Return user details and token
return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    token
};
};

module.exports = {
    registerUser,
    loginUser
};