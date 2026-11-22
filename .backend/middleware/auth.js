const jwt = require("jsonwebtoken");
const { requestService } = require("../services/serviceRequest");

module.exports = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secret_key"
    );

    req.user = decoded;
    const serviceName = process.env.SERVICE_NAME;
    if (serviceName && serviceName !== "users" && serviceName !== "monolith") {
      try {
        const profile = await requestService("users", "/users/internal/validate", {
          token,
          internal: true,
        });
        if (!profile.user || String(profile.user.id) !== String(decoded.id)) {
          return res.status(401).json({ error: "Account is no longer available" });
        }
        req.user.is_admin = Boolean(profile.user.is_admin);
      } catch (error) {
        if (error.statusCode === 401 || error.statusCode === 404) {
          return res.status(401).json({ error: "Account is no longer available" });
        }
        console.error("Could not verify the account with the Users service:", error.message);
        return res.status(503).json({ error: "Account verification is temporarily unavailable" });
      }
    }

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};