const db = require("../db");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { uploadDirectory } = require("../middleware/upload");

const detectImageExtension = (file) => {
  const buffer = file.buffer;
  const isJpeg = buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  const isPng = buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const isWebp = buffer.length >= 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP";

  if (isJpeg) return ".jpg";
  if (isPng) return ".png";
  if (isWebp) return ".webp";
  return null;
};

exports.uploadImage = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Image file is required" });
  const detectedExtension = detectImageExtension(req.file);
  if (!detectedExtension) return res.status(400).json({ error: "Unsupported or invalid image content" });

  const hash = crypto.createHash("sha256").update(req.file.buffer).digest("hex");
  const extension = detectedExtension;

  try {
    const preferredFilename = `${hash}${extension}`;
    const preferredPath = path.join(uploadDirectory, preferredFilename);
    if (await fs.promises.access(preferredPath).then(() => true).catch(() => false)) {
      return res.status(200).json({
        url: `${req.protocol}://${req.get("host")}/uploads/${preferredFilename}`,
        filename: preferredFilename,
        duplicate: true,
      });
    }

    const existingFiles = await fs.promises.readdir(uploadDirectory);
    for (const existingFile of existingFiles) {
      const existingPath = path.join(uploadDirectory, existingFile);
      const existingStats = await fs.promises.stat(existingPath);
      if (!existingStats.isFile()) continue;
      const existingHash = crypto.createHash("sha256").update(await fs.promises.readFile(existingPath)).digest("hex");
      if (existingHash === hash) {
        return res.status(200).json({
          url: `${req.protocol}://${req.get("host")}/uploads/${existingFile}`,
          filename: existingFile,
          duplicate: true,
        });
      }
    }

    const filename = preferredFilename;
    await fs.promises.writeFile(preferredPath, req.file.buffer, { flag: "wx" });
    return res.status(201).json({
      url: `${req.protocol}://${req.get("host")}/uploads/${filename}`,
      filename,
      duplicate: false,
    });
  } catch (error) {
    return res.status(500).json({ error: `Could not save image: ${error.message}` });
  }
};

exports.getAllProducts = (req, res) => {
  // Fixed: Specified p.is_deleted to clear the SQL ambiguity
  const sql = `
    SELECT p.*, MIN(c.id) AS category_id, GROUP_CONCAT(c.name) AS category_name, GROUP_CONCAT(c.name) AS category_names
    FROM products p 
    LEFT JOIN product_categories pc ON p.id = pc.product_id 
    LEFT JOIN categories c ON pc.category_id = c.id 
    WHERE p.is_deleted = 0 
    GROUP BY p.id
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

exports.getAllCategory = (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT p.* 
    FROM products p 
    INNER JOIN product_categories c ON p.id = c.product_id 
    WHERE c.category_id = ? AND p.is_deleted = 0
  `;

  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

exports.getAllTags = (req, res) => {
  // Fixed: Corrected ORDER BY clause and removed unnecessary [id] binding
  const sql = `
    SELECT c.id, c.name 
    FROM categories c 
    INNER JOIN product_categories pc ON c.id = pc.category_id 
    INNER JOIN products p ON pc.product_id = p.id 
    WHERE c.is_deleted = 0 AND p.is_deleted = 0
    GROUP BY c.id, c.name 
    ORDER BY c.name ASC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

exports.getProductById = (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT p.*, MIN(c.id) AS category_id, GROUP_CONCAT(c.name) AS category_name, GROUP_CONCAT(c.name) AS category_names
    FROM products p 
    LEFT JOIN product_categories pc ON p.id = pc.product_id 
    LEFT JOIN categories c ON pc.category_id = c.id 
    WHERE p.id = ? AND p.is_deleted = 0 
    GROUP BY p.id
  `;

  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: "Product not found" });
    res.json(results[0]);
  });
};

exports.createProduct = (req, res) => {
  const { name, description, price, image_url, category_id } = req.body;
  const sql = "INSERT INTO products (name, description, price, image_url, admin_id) VALUES (?, ?, ?, ?, ?)";

  db.query(sql, [name, description, price, image_url, req.user.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    
    const product = { 
      id: result.insertId, 
      name, 
      description, 
      price, 
      image_url 
    };
    if (!category_id) return res.status(201).json(product);
    db.query("INSERT INTO product_categories (product_id, category_id) VALUES (?, ?)", [result.insertId, category_id], (categoryError) => {
      if (categoryError) return res.status(500).json({ error: categoryError.message });
      res.status(201).json(product);
    });
  });
};

exports.updateProduct = (req, res) => {
  const { id } = req.params;
  const { name, description, price, image_url, category_id } = req.body;
  const sql = "UPDATE products SET name=?, description=?, price=?, image_url=? WHERE id=? AND is_deleted = 0";

  // Fixed: Converted back to standard callback handling for db.query
  db.query(sql, [name, description, price, image_url, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!category_id) return res.json({ message: "Product updated" });
    db.query("DELETE FROM product_categories WHERE product_id = ?", [id], (deleteError) => {
      if (deleteError) return res.status(500).json({ error: deleteError.message });
      db.query("INSERT INTO product_categories (product_id, category_id) VALUES (?, ?)", [id, category_id], (categoryError) => {
        if (categoryError) return res.status(500).json({ error: categoryError.message });
        res.json({ message: "Product updated" });
      });
    });
  });
};

exports.deleteProduct = (req, res) => {
  const { id } = req.params;
  const sql = "UPDATE products SET is_deleted = 1 WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Product archived (Soft Deleted)" });
  });
};