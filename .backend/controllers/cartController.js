const { query } = require("../services/database");
const { requestService } = require("../services/serviceRequest");

exports.getCart = async (req, res) => {
  try {
    const cartRows = await query(
      "SELECT id, product_id, quantity FROM cart WHERE user_id = ?",
      [req.user.id],
    );
    const items = await Promise.all(cartRows.map(async (row) => {
      const product = await requestService("catalog", `/products/${row.product_id}`, {
        token: req.headers.authorization?.slice(7),
      });
      return {
        id: row.id,
        product_id: row.product_id,
        quantity: row.quantity,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
      };
    }));
    res.json(items);
  } catch (err) {
    res.status(err.statusCode || 502).json({ error: err.message });
  }
};

exports.addToCart = async (req, res) => {
  const { product_id, quantity } = req.body;
  if (!Number.isInteger(Number(product_id)) || Number(product_id) < 1 ||
      !Number.isInteger(Number(quantity)) || Number(quantity) < 1) {
    return res.status(400).json({ error: "A valid product and positive integer quantity are required" });
  }

  try {
    await requestService("catalog", `/products/${product_id}`, {
      token: req.headers.authorization?.slice(7),
    });
    await query(
      "INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)",
      [req.user.id, product_id, quantity],
    );
    res.json({ message: "Cart updated" });
  } catch (err) {
    res.status(err.statusCode || 502).json({ error: err.message });
  }
};

exports.updateQuantity = async (req, res) => {
  const { quantity } = req.body;
  if (!Number.isInteger(Number(quantity)) || Number(quantity) < 1) {
    return res.status(400).json({ error: "Quantity must be a positive integer" });
  }

  try {
    await query("UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?", [quantity, req.params.id, req.user.id]);
    res.json({ message: "Quantity updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    await query("DELETE FROM cart WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
    res.json({ message: "Item removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    await query("DELETE FROM cart WHERE user_id = ?", [req.user.id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteUserCart = async (req, res) => {
  try {
    await query("DELETE FROM cart WHERE user_id = ?", [req.params.userId]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};