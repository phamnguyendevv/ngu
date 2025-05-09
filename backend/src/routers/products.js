const {
  getproController,
  addproController,
  addcatController,
  getcatController,
  getprobycateController,
  addorderController,
  getorderController,
  getAllProController,
  getcatebynameController,
  getlistcatController,
  addCartController,
  removeCartController,
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} = require("../controllers/products.controller");

const express = require("express");
const router = express.Router();

router.post("/addproducts", addproController);
router.post("/product/list", getproController);
router.get("/get-all-products", getAllProController);
router.get("/getprobycate/:categoryId", getprobycateController);

// -------------------categoris----------------

router.post("/addcategoris", addcatController);
router.get("/getcategoris", getcatController);
router.get("/category", getcatebynameController);
router.get("/category/list", getlistcatController);

// -------------------------orders-------------------

router.post("/add-cart", addCartController);
router.post("/remove-cart", removeCartController);

router.get("/orders/:user_id", getorderController);
router.post("/orders", addorderController);

// -------------------------wishlist-------------------
router.post("/add", addToWishlist);
router.delete("/remove", removeFromWishlist);
router.get("/:user_id", getWishlist);

module.exports = router;
