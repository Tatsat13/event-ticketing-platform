const pool = require("../config/db");

const findUserByEmail = async (email) => {
    const [rows] = await pool.execute(
        "SELECT * FROM users WHERE email = ?",
        [email]
    );

    return rows[0];
};

const createUser = async (name, email, passwordHash, role) => {
    const [result] = await pool.execute(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES (?, ?, ?, ?)`,
        [name, email, passwordHash, role]
    );

    return result.insertId;
};

module.exports = {
    findUserByEmail,
    createUser
};