const express = require("express");
const {
  getAllproduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductDetails,
  getBySearch,
  createProductReview,
  getproductReview,
  deleteReviwe,
} = require("../controller/productController");
const { isAuthanticateUser, authorizeRoles } = require("../middleware/auth");
const router = express.Router();

router.route("/products").get(isAuthanticateUser, getAllproduct);

// router.route("/search/:key").get(getBySearch);

router.route("/product/new").post(isAuthanticateUser, createProduct);

router
  .route("/product/:id")
  .put(isAuthanticateUser, updateProduct)
  .delete(isAuthanticateUser, deleteProduct)
  .get(getProductDetails);

router.route("/review").put(isAuthanticateUser, createProductReview)

router.route("/reviews").get(getproductReview).delete(isAuthanticateUser,deleteReviwe)

module.exports = router;
