const express = require("express");
const {
  createOrder,
  getSingleOrder,
  getAlleOrders,
  myOrders,
  deletOrder,
  updateOrderStatus,
} = require("../controller/orderController");

const { isAuthanticateUser, authorizeRoles } = require("../middleware/auth");
const router = express.Router();

router.route("/order/new").post(isAuthanticateUser, createOrder);

router
  .route("/order/:id")
  .get(isAuthanticateUser, authorizeRoles("admin"), getSingleOrder);

router
  .route("/admin/orders")
  .get(isAuthanticateUser, authorizeRoles("admin"), getAlleOrders);

router.route("/myorders").get(isAuthanticateUser, myOrders);

router
  .route("/admin/order/:id")
  .delete(isAuthanticateUser, authorizeRoles("admin"), deletOrder)
  .put(isAuthanticateUser, authorizeRoles("admin"), updateOrderStatus);

module.exports = router;
