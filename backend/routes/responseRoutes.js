const express = require("express");
const router = express.Router();
const Response = require("../models/Response");
const auth = require("../middleware/auth");

// ADD RESPONSE
router.post("/add", auth, async (req, res) => {
  try {
    const { feeling, medicationTaken, symptoms } = req.body;

    const f = feeling.toLowerCase();
    const m = medicationTaken.toLowerCase();
    const s = symptoms.toLowerCase();

    let score = 0;

    // feeling
    if (f === "okay") score += 1;
    if (f === "bad") score += 2;

    // medication
    if (m === "no") score += 2;

    // symptoms
    if (s === "mild") score += 2;
    if (s === "severe") score += 4;

    let riskLevel = "Low";

    if (score >= 6) riskLevel = "High";
    else if (score >= 3) riskLevel = "Medium";

    const response = new Response({
      ...req.body,
      riskLevel,
    });

    await response.save();
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET RESPONSES
router.get("/", auth, async (req, res) => {
  const responses = await Response.find().populate("patientId");
  res.json(responses);
});
router.get("/patient/:id", auth, async (req, res) => {
  try {
    const responses = await Response.find({
      patientId: req.params.id,
    }).sort({ createdAt: -1 });

    res.json(responses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
const mongoose = require("mongoose");

router.get("/summary/:id", auth, async (req, res) => {
  try {
    const responses = await Response.find({
      patientId: req.params.id,
    });

    if (responses.length === 0) {
      return res.json({ message: "No data" });
    }

    const latestResponse = responses[responses.length - 1];

    res.json({
      latestRisk: latestResponse.riskLevel,
      feeling: latestResponse.feeling,
      symptoms: latestResponse.symptoms,
      medicationTaken: latestResponse.medicationTaken,
      createdAt: latestResponse.createdAt, // ✅ safe now
    });
  } catch (err) {
    console.log("SUMMARY ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
