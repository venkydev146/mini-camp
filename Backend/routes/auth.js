const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const StudentRegistration = require("../models/StudentRegistration");
const StudentLogin = require("../models/Studentlogin");
const Admin = require("../models/Admin");

// =========================
//      STUDENT REGISTER
// =========================
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

    const existing = await StudentRegistration.findOne({ registerNumber });
    if (existing) {
      return res.status(400).json({ message: "User already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedRegPassword = await bcrypt.hash(registerPassword, 10);

    await StudentRegistration.create({
      name,
      email,
      password: hashedPassword,
      registerNumber,
      registerPassword: hashedRegPassword,
      department,
      branch,
      section
    });

    res.status(201).json({ message: "Registration successful" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// =========================
//      STUDENT LOGIN
// =========================
router.post("/login", async (req, res) => {
  try {
    const { registerNumber, registerPassword } = req.body;

    const user = await StudentRegistration.findOne({ registerNumber });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(registerPassword, user.registerPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    await StudentLogin.create({
      registerNumber,
      loginTime: new Date()
    });

    res.status(200).json({ message: "Login successful" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// =========================
//      ADMIN LOGIN (username)
// =========================
router.post("/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(400).json({ message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }
    const token = jwt.sign({id:admin._id,username:admin.username},
      process.env.JWT_SECRET,
      {expiresIn:"1d"}

    );

    return res.status(200).json({ message: "Admin login successful" });

  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

// =========================
//    ADMIN VIEW STUDENTS
// =========================
router.get("/admin/students", async (req, res) => {
  try {
    const all = await StudentRegistration.find()
      .select("-password -registerPassword");

    res.json(all);

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;