const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require("multer");

const productsRoutes = require("./routes/products");
const usersRoutes = require("./routes/users");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/orders");
const categoriesRoutes = require("./routes/categories");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/products", productsRoutes);
app.use("/users", usersRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);
app.use("/categories", categoriesRoutes);

app.get("/", (req, res) => {
  res.send("API running");
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