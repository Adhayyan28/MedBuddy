const mongoose = require("mongoose");

const responseSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
  },
  feeling: String, // Good / Okay / Bad
  medicationTaken: String, // Yes / No
  symptoms: String, // None / Mild / Severe
  riskLevel: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Response", responseSchema);
