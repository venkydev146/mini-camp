const pool = require("../../config/db");

module.exports = {
    createTable: async () => {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS student_logins (
                id SERIAL PRIMARY KEY,
                registerNumber VARCHAR(255),
                loginTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
    },

    createLogin: async (registerNumber) => {
        await pool.query(
            "INSERT INTO student_logins (registerNumber) VALUES ($1)",
            [registerNumber]
        );
    }
};