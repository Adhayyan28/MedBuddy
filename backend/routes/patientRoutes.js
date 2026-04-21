const express = require("express");
const router = express.Router();
const Patient = require("../models/patient");
const auth = require("../middleware/auth");

// ADD PATIENT
router.post("/add", auth, async (req, res) => {
  try {
    const patient = new Patient(req.body);
    await patient.save();
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ALL PATIENTS
router.get("/", auth, async (req, res) => {
  const patients = await Patient.find();
  res.json(patients);
});

//delete
router.delete("/:id", auth, async (req, res) => {
  try {
    await Patient.findByIdAndDelete(req.params.id);
    res.json({ message: "Patient deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
