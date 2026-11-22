const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const auth = require("../middleware/auth");
const serviceAuth = require("../middleware/serviceAuth");

router.delete("/internal/users/:userId", serviceAuth, orderController.deleteUserOrders);
router.use(auth);

router.post("/", orderController.createOrder);
router.get("/", orderController.getOrders);
router.get("/:id", orderController.getOrderDetails);

module.exports = router;