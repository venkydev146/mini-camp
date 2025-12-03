const pool = require("../../config/db");

module.exports = {
    createTable: async () => {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS student_registrations (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255),
                email VARCHAR(255),
                password TEXT,
                registerNumber VARCHAR(255),
                registerPassword TEXT,
                department VARCHAR(255),
                branch VARCHAR(255),
                section VARCHAR(255),
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
    },

    registerStudent: async (student) => {
        const {
            name, email, password,
            registerNumber, registerPassword,
            department, branch, section
        } = student;

        await pool.query(
            `INSERT INTO student_registrations 
            (name, email, password, registerNumber, registerPassword, department, branch, section)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
            [
                name, email, password,
                registerNumber, registerPassword,
                department, branch, section
            ]
        );
    },

    getAllStudents: async () => {
        const result = await pool.query("SELECT * FROM student_registrations");
        return result.rows;
    }
};
