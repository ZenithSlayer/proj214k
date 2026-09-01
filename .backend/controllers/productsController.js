const db = require("../db");

exports.getAllProducts = (req, res) => {
  // Fixed: Specified p.is_deleted to clear the SQL ambiguity
  const sql = `
    SELECT p.*, GROUP_CONCAT(c.name) AS category_names 
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
    SELECT p.*, GROUP_CONCAT(c.name) AS category_names 
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
  const { name, description, price, image_url, admin_id } = req.body;
  const sql = "INSERT INTO products (name, description, price, image_url, admin_id) VALUES (?, ?, ?, ?, ?)";

  db.query(sql, [name, description, price, image_url, admin_id || 1], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    
    res.status(201).json({ 
      id: result.insertId, 
      name, 
      description, 
      price, 
      image_url 
    });
  });
};

exports.updateProduct = (req, res) => {
  const { id } = req.params;
  const { name, description, price, image } = req.body;
  const sql = "UPDATE products SET name=?, description=?, price=?, image_url=? WHERE id=? AND is_deleted = 0";

  // Fixed: Converted back to standard callback handling for db.query
  db.query(sql, [name, description, price, image, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Product updated" });
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