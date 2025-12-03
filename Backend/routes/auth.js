const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// get pool from config (works whether config exports { connectDB, pool } or exports pool)
const dbModule = require("../config/db");
const pool = dbModule.pool || dbModule;

// -------------------------
// STUDENT REGISTER
// POST /api/auth/register
// -------------------------
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      registerNumber,
      registerPassword,
      department,
      branch,
      section
    } = req.body;

    if (!registerNumber || !registerPassword) {
      return res.status(400).json({ message: "Register number and password required" });
    }

    // check if registerNumber exists
    const exists = await pool.query(
      "SELECT id FROM student_registrations WHERE registernumber = $1",
      [registerNumber]
    );

    if (exists.rows.length > 0) {
      return res.status(400).json({ message: "User already registered" });
    }

    // hash passwords
    const hashedPassword = await bcrypt.hash(password || "", 10);
    const hashedRegPassword = await bcrypt.hash(registerPassword, 10);

    await pool.query(
      `INSERT INTO student_registrations
        (name, email, password, registernumber, registerpassword, department, branch, section)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [name, email, hashedPassword, registerNumber, hashedRegPassword, department, branch, section]
    );

    return res.status(201).json({ message: "Registration successful" });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// -------------------------
// STUDENT LOGIN
// POST /api/auth/login
// -------------------------
router.post("/login", async (req, res) => {
  try {
    const { registerNumber, registerPassword } = req.body;

    if (!registerNumber || !registerPassword) {
      return res.status(400).json({ message: "Register number and password required" });
    }

    const result = await pool.query(
      "SELECT * FROM student_registrations WHERE registernumber = $1",
      [registerNumber]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(registerPassword, user.registerpassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    // record login
    await pool.query(
      "INSERT INTO student_logins (registernumber) VALUES ($1)",
      [registerNumber]
    );

    // You can return user info (without passwords) if you want
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      registerNumber: user.registernumber,
      department: user.department,
      branch: user.branch,
      section: user.section,
      createdAt: user.createdat
    };

    return res.status(200).json({ message: "Login successful", user: safeUser });
  } catch (err) {
    console.error("STUDENT LOGIN ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// -------------------------
// ADMIN LOGIN (username + password)
// POST /api/auth/admin/login
// returns token
// -------------------------
router.post("/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: "Missing credentials" });

    const result = await pool.query("SELECT * FROM admins WHERE username = $1", [username]);
    if (result.rows.length === 0) return res.status(400).json({ message: "Admin not found" });

    const admin = result.rows[0];
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect password" });

    // sign JWT
    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET || "devsecret",
      { expiresIn: "1d" }
    );

    return res.status(200).json({ message: "Admin login successful", token });
  } catch (err) {
    console.error("ADMIN LOGIN ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// -------------------------
// ADMIN VIEW STUDENTS
// GET /api/auth/admin/students
// Protected: requires Bearer token
// -------------------------
router.get("/admin/students", async (req, res) => {
  try {
    // Read bearer token
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.split(" ")[1] : null;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
      jwt.verify(token, process.env.JWT_SECRET || "devsecret");
    } catch (e) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const result = await pool.query(
      "SELECT id,name,email,registernumber,department,branch,section,createdat FROM student_registrations ORDER BY createdat DESC"
    );
    return res.json(result.rows);
  } catch (err) {
    console.error("ADMIN STUDENTS ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;