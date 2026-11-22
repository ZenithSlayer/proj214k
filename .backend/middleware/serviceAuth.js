const crypto = require("crypto");

module.exports = (req, res, next) => {
  const expected = process.env.SERVICE_TO_SERVICE_SECRET;
  const supplied = req.get("x-service-token") || "";
  const expectedBuffer = Buffer.from(expected || "");
  const suppliedBuffer = Buffer.from(supplied);

  if (!expected || suppliedBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(suppliedBuffer, expectedBuffer)) {
    return res.status(401).json({ error: "Unauthorized service request" });
  }

  next();
};
