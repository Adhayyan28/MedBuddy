const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/user");

mongoose
  .connect("mongodb://127.0.0.1:27017/medbuddy")
  .then(async () => {
    const hashed = await bcrypt.hash("123456", 10);

    await User.deleteMany({ email: "doctor@medbuddy.com" }); // optional reset
    await User.create({
      email: "doctor@medbuddy.com",
      password: hashed,
    });

    console.log("Doctor user created");
    process.exit();
  })
  .catch((err) => console.log(err));
