require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");
const path = require("path");

const adminRoutes = require("./routes/admin");
const authRoutes = require("./routes/auth");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Connect DB
connectDB();

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

// Serve static frontend
app.use(express.static(path.join(__dirname, "frontend")));

// Catch-all (works in Express v5)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));