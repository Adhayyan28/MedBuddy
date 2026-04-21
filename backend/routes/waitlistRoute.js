const express = require("express");
const router = express.Router();
const Waitlist = require("../models/waitlist");
const auth = require("../middleware/auth");

// ADD TO WAITLIST
router.post("/add", auth, async (req, res) => {
  try {
    const { patientId, reason } = req.body; // ✅ FIX 1

    const existing = await Waitlist.findOne({
      patientId, // ✅ now defined
    });

    if (existing) {
      return res.json({ message: "Already in waitlist" });
    }

    const newEntry = new Waitlist({
      patientId,
      reason,
    });

    await newEntry.save();

    res.json(newEntry); // ✅ FIX 2
  } catch (err) {
    console.log("WAITLIST ERROR:", err); // ✅ helpful debug
    res.status(500).json({ error: err.message });
  }
});

// GET WAITLIST
router.get("/", auth, async (req, res) => {
  const data = await Waitlist.find().populate("patientId");
  res.json(data);
});
//delete
router.delete("/:id", auth, async (req, res) => {
  try {
    await Waitlist.findByIdAndDelete(req.params.id);
    res.json({ message: "Removed from waitlist" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
