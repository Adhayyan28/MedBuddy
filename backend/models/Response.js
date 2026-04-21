const mongoose = require("mongoose");

const responseSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
  },
  feeling: String,
  medicationTaken: String,
  symptoms: String,
  riskLevel: String,
  reasons: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Response", responseSchema);
