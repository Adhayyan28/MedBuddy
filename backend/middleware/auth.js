const jwt = require("jsonwebtoken");

const JWT_SECRET = "medbuddy_secret";

const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ message: "No token, access denied" });
    }

    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;

    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = auth;
