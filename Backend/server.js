require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect Database
connectDB();
const adminRoutes = require("./routes/admin");
const authRoutes = require("./routes/auth")
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin",adminRoutes)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));