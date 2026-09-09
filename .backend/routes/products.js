const express = require("express");
const router = express.Router();
const productsController = require("../controllers/productsController");
const upload = require("../middleware/upload");
const auth = require("../middleware/auth");

router.get("/tag", productsController.getAllTags);
router.get("/tag/:id", productsController.getAllCategory);
router.get("/", productsController.getAllProducts);
router.get("/:id", productsController.getProductById);
router.use(auth);
router.post("/upload-image", upload.single("image"), productsController.uploadImage);
router.post("/", productsController.createProduct);
router.put("/:id", productsController.updateProduct);
router.delete("/:id", productsController.deleteProduct);


module.exports = router;