const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadDirectory = path.join(__dirname, "..", "uploads");
fs.mkdirSync(uploadDirectory, { recursive: true });

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

module.exports = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return callback(new Error("Only JPG, PNG, and WebP images are allowed"));
    }
    callback(null, true);
  },
});

module.exports.uploadDirectory = uploadDirectory;