const pool = require("../../config/db");

module.exports = {
    createTable: async () => {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS admins (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password TEXT NOT NULL
            );
        `);
    },

    findByUsername: async (username) => {
        const result = await pool.query(
            "SELECT * FROM admins WHERE username=$1",
            [username]
        );
        return result.rows[0];
    },

    createAdmin: async (username, password) => {
        await pool.query(
            "INSERT INTO admins (username, password) VALUES ($1, $2)",
            [username, password]
        );
    }
};