const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const auth = require("../middleware/auth");
const serviceAuth = require("../middleware/serviceAuth");

router.delete("/internal/users/:userId", serviceAuth, cartController.deleteUserCart);
router.use(auth);

router.get("/", cartController.getCart);
router.post("/", cartController.addToCart);
router.delete("/", cartController.clearCart);
router.put("/:id", cartController.updateQuantity);
router.delete("/:id", cartController.removeFromCart);

module.exports = router;