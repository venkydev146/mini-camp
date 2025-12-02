const mongoose = require("mongoose");

const StudentRegistrationSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  registerNumber: String,
  registerPassword: String,
  department: String,
  branch: String,
  section: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("StudentRegistration", StudentRegistrationSchema);