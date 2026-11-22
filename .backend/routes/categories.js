const express = require("express");
const categoriesController = require("../controllers/categoriesController");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const router = express.Router();

router.get("/", categoriesController.getCategories);
router.use(auth, admin);
router.post("/", categoriesController.createCategory);

module.exports = router;