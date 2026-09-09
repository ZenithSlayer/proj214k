const db = require("../db");

exports.getCategories = (req, res) => {
  db.query(
    "SELECT id, name FROM categories WHERE is_deleted = 0 ORDER BY name ASC",
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    },
  );
};

exports.createCategory = (req, res) => {
  const name = String(req.body.name || "").trim();
  const description = String(req.body.description || "").trim();

  if (!name) return res.status(400).json({ error: "Category name is required" });

  db.query(
    "SELECT id FROM categories WHERE name = ? AND is_deleted = 0 LIMIT 1",
    [name],
    (lookupError, existing) => {
      if (lookupError) return res.status(500).json({ error: lookupError.message });
      if (existing.length) return res.status(409).json({ error: "Category already exists" });

      db.query(
        "INSERT INTO categories (name, description, is_deleted) VALUES (?, ?, 0)",
        [name, description],
        (err, result) => {
          if (err) return res.status(500).json({ error: err.message });
          res.status(201).json({ id: result.insertId, name, description });
        },
      );
    },
  );
};