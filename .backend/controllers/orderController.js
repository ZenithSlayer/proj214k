const { query } = require("../services/database");
const { requestService } = require("../services/serviceRequest");

const getBearerToken = (req) => req.headers.authorization?.replace(/^Bearer\s+/i, "");
const toCents = (price) => {
  const match = String(price).match(/^(0|[1-9]\d*)(?:\.(\d{1,2}))?$/);
  if (!match) return null;
  return Number(match[1]) * 100 + Number((match[2] || "").padEnd(2, "0"));
};

exports.createOrder = async (req, res) => {
  const userId = req.user.id;
  const token = getBearerToken(req);
  let transactionStarted = false;

  try {
    const [profile, cartItems] = await Promise.all([
      requestService("users", "/users/me", { token }),
      requestService("cart", "/cart", { token }),
    ]);

    if (!profile.addresses?.length) {
      return res.status(400).json({ error: "No shipping address found. Please add an address before checkout." });
    }
    if (!profile.cards?.length) {
      return res.status(400).json({ error: "No payment method found. Please add a payment method before checkout." });
    }
    if (!cartItems.length) {
      return res.status(400).json({ error: "Your cart is empty." });
    }

    const items = await Promise.all(cartItems.map(async (item) => {
      if (!Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1) {
        throw new Error("Cart contains an invalid quantity");
      }

      const product = await requestService("catalog", `/products/${item.product_id}`, { token });
      const unitPriceCents = toCents(product.price);
      if (!Number.isSafeInteger(unitPriceCents) || unitPriceCents < 0) {
        throw new Error(`Catalog returned an invalid price for product ${item.product_id}`);
      }

      return {
        productId: item.product_id,
        productName: product.name,
        quantity: Number(item.quantity),
        unitPriceCents,
      };
    }));

    const totalCents = items.reduce((total, item) => total + item.unitPriceCents * item.quantity, 0);
    if (!Number.isSafeInteger(totalCents) || totalCents > 9_999_999_999) {
      return res.status(400).json({ error: "Order total is outside the supported range." });
    }

    await query("START TRANSACTION");
    transactionStarted = true;
    const orderResult = await query(
      "INSERT INTO orders (user_id, total, status) VALUES (?, ?, ?)",
      [userId, (totalCents / 100).toFixed(2), "pending"],
    );

    for (const item of items) {
      await query(
        "INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES (?, ?, ?, ?, ?)",
        [orderResult.insertId, item.productId, item.productName, item.quantity, (item.unitPriceCents / 100).toFixed(2)],
      );
    }

    await query("COMMIT");
    transactionStarted = false;
    let cartCleared = true;
    try {
      await requestService("cart", "/cart", { method: "DELETE", token });
    } catch (error) {
      cartCleared = false;
      console.error(`Order ${orderResult.insertId} was created, but the cart could not be cleared:`, error.message);
    }

    res.status(201).json({
      message: "Order placed successfully",
      orderId: orderResult.insertId,
      total: (totalCents / 100).toFixed(2),
      status: "pending",
      cartCleared,
    });
  } catch (err) {
    if (transactionStarted) {
      try {
        await query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Could not roll back failed order transaction:", rollbackError.message);
      }
    }
    res.status(err.statusCode || 502).json({ error: err.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const results = await query(
      "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id],
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOrderDetails = async (req, res) => {
  try {
    const results = await query(
      "SELECT oi.* FROM order_items oi INNER JOIN orders o ON o.id = oi.order_id WHERE o.id = ? AND o.user_id = ?",
      [req.params.id, req.user.id],
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteUserOrders = async (req, res) => {
  try {
    await query("DELETE FROM orders WHERE user_id = ?", [req.params.userId]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
