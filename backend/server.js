const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());

app.use(express.json());
const patientRoutes = require("./routes/patientRoutes");
app.use("/api/patients", patientRoutes);
const responseRoutes = require("./routes/responseRoutes");
app.use("/api/responses", responseRoutes);
const authRoutes = require("./routes/authroute");
app.use("/api/auth", authRoutes);
const waitlistRoutes = require("./routes/waitlistRoute");
app.use("/api/waitlist", waitlistRoutes);
mongoose
  .connect("mongodb://127.0.0.1:27017/medbuddy")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("MedBuddy server is running");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
