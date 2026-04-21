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
    let reasons = [];

    let score = 0;

    // feeling
    // feeling
    if (f === "okay") {
      score += 1;
      reasons.push("Patient feeling is not fully normal");
    }
    if (f === "bad") {
      score += 2;
      reasons.push("Patient feeling is bad");
    }

    // medication
    if (m === "no") {
      score += 2;
      reasons.push("Medication not taken");
    }

    // symptoms
    if (s === "mild") {
      score += 1;
      reasons.push("Mild symptoms present");
    }
    if (s === "severe") {
      score += 3;
      reasons.push("Severe symptoms observed");
    }

    let riskLevel = "Low";

    if (score >= 5) riskLevel = "High";
    else if (score >= 2) riskLevel = "Medium";

    const response = new Response({
      ...req.body,
      riskLevel,
      reasons,
    });

    await response.save();
    const Waitlist = require("../models/waitlist");

    // AUTO WAITLIST MANAGEMENT
    const existing = await Waitlist.findOne({
      patientId: req.body.patientId,
      status: "Pending",
    });

    if (riskLevel === "High") {
      // ADD if not already present
      if (!existing) {
        await Waitlist.create({
          patientId: req.body.patientId,
          reason: "Auto - High Risk",
          status: "Pending",
        });
      }
    } else {
      // REMOVE if risk reduced
      if (existing) {
        await Waitlist.deleteOne({ _id: existing._id });
      }
    }
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
      createdAt: latestResponse.createdAt,
      reasons: latestResponse.reasons,
    });
  } catch (err) {
    console.log("SUMMARY ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
