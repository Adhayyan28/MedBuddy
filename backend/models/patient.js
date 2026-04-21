const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
  name: String,
  phone: String,
  condition: String,
  medications: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Patient", patientSchema);
