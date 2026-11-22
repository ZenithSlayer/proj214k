const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const crypto = require("crypto");
const db = require("./db");

const app = express();
const serviceName = process.env.SERVICE_NAME || "monolith";
app.set("trust proxy", 1);

app.use(cors());
app.use((req, res, next) => {
  const startedAt = process.hrtime.bigint();
  const suppliedId = req.get("x-request-id");
  const requestId = suppliedId && /^[a-zA-Z0-9._-]{1,128}$/.test(suppliedId)
    ? suppliedId
    : crypto.randomUUID();
  res.setHeader("x-request-id", requestId);
  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    console.info(JSON.stringify({
      level: "info",
      event: "http.request",
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: Math.round(durationMs * 100) / 100,
    }));
  });
  next();
});
app.use(express.json());

const loadServiceRoutes = {
  users: () => [["/users", require("./routes/users")]],
  catalog: () => [
    ["/products", require("./routes/products")],
    ["/categories", require("./routes/categories")],
  ],
  cart: () => [["/cart", require("./routes/cart")]],
  orders: () => [["/orders", require("./routes/orders")]],
  monolith: () => [
    ["/products", require("./routes/products")],
    ["/users", require("./routes/users")],
    ["/cart", require("./routes/cart")],
    ["/orders", require("./routes/orders")],
    ["/categories", require("./routes/categories")],
  ],
};

if (!loadServiceRoutes[serviceName]) {
  throw new Error(`Unknown SERVICE_NAME: ${serviceName}`);
}

if (serviceName === "catalog" || serviceName === "monolith") {
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));
}

if (serviceName === "catalog") {
  const serviceAuth = require("./middleware/serviceAuth");
  const { invalidateCatalog } = require("./services/catalog");
  app.post("/internal/catalog/cache/invalidate", serviceAuth, async (_req, res) => {
    await invalidateCatalog();
    res.status(204).end();
  });
}

for (const [prefix, routes] of loadServiceRoutes[serviceName]()) {
  app.use(prefix, routes);
}

app.get("/", (req, res) => {
  res.send("API running");
});

app.get("/health/ready", (_req, res) => {
  db.query("SELECT 1", (error) => {
    if (error) return res.status(503).json({ status: "unavailable" });
    res.json({ status: "ready" });
  });
});

app.use((error, _req, res, _next) => {
  if (error instanceof multer.MulterError) {
    const message = error.code === "LIMIT_FILE_SIZE" ? "Image must be 10 MB or smaller" : error.message;
    return res.status(400).json({ error: message });
  }
  if (error?.message?.includes("Only JPG")) return res.status(400).json({ error: error.message });
  res.status(500).json({ error: error?.message || "Unexpected server error" });
});

module.exports = app;