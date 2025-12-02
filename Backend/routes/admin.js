const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const Admin = require("../models/Admin");

// --------------------------------------
//  ADMIN REGISTER  (Run only once manually)
// --------------------------------------
router.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if admin exists
        const existing = await Admin.findOne({ username });
        if (existing) {
            return res.status(400).json({ message: "Admin already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await Admin.create({
            username,
            password: hashedPassword
        });

        return res.status(201).json({ message: "Admin created successfully" });
    } catch (err) {
        return res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;