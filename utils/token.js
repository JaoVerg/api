const jwt = require("jsonwebtoken");

exports.createToken = (userId) => {
  const payload = { userId };
  return jwt.sign(payload, "Q$r2K6W8n!jCW%Zk", { expiresIn: "1h" });
};
