const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

// get pool from config (works whether config exports { connectDB, pool } or pool directly)
const dbModule = require("../config/db");
const pool = dbModule.pool || dbModule;

// POST /api/admin/register  (create admin - run once)
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: "Missing fields" });

    // check existing
    const existing = await pool.query("SELECT id FROM admins WHERE username = $1", [username]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    await pool.query("INSERT INTO admins (username, password) VALUES ($1, $2)", [username, hashed]);

    return res.status(201).json({ message: "Admin created successfully" });
  } catch (err) {
    console.error("ADMIN REGISTER ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;