const mongoose = require("mongoose");

const StudentLoginSchema = new mongoose.Schema({
    registerNumber: {
        type: String,
        required: true
    },
    loginTime: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("StudentLogin", StudentLoginSchema);