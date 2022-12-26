const Order = require("../models/orderModule");
const Product = require("../models/productModel");
const Errorhandlers = require("../utils/errorHandlers");
const catchAsyncError = require("../middleware/asyncError");
const ApiFeature = require("../utils/apiFeatures");

//Create new Order
exports.createOrder = catchAsyncError(async (req, res, next) => {
  const {
    shippingInfo,
    oderItems,
    paymentInfo,
    shippingPrice,
    taxPrice,
    totalPrice,
    itemsPrice,
  } = req.body;

  const order = await Order.create({
    shippingInfo,
    oderItems,
    paymentInfo,
    shippingPrice,
    taxPrice,
    totalPrice,
    itemsPrice,
    paidAt: Date.now(),
    user: req.user._id,
  });

  order.save();

  res.status(201).json({
    success: true,
    message: "Order createrd sussfully",
    order,
  });
});

//Get single order
exports.getSingleOrder = catchAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!order) {
    return next(new Errorhandlers("Order not found with this id", 404));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

//Get all order deta --> (Admin)
exports.getAlleOrders = catchAsyncError(async (req, res, next) => {
  const order = await Order.find();

  if (!order) {
    return next(new Errorhandlers("Orders not found ", 404));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

//get loggod in user order
exports.myOrders = catchAsyncError(async (req, res, next) => {
  const order = await Order.find({ user: req.user._id });

  if (!order) {
    return next(new Errorhandlers("Orders not found ", 404));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

// Update Order Status -- (Admin)
exports.updateOrderStatus = catchAsyncError(async (req, res, next) => {

  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new Errorhandlers("Order not found with this id", 404));
  }

  if (order.orderStatus === "Delivered") {
    return next(new Errorhandlers("Your ordered Is Alll ready delivered", 404));
  }

  order.oderItems.forEach(async (order) => {
    await updateStock(order.product, order.quantity);
  });

  if (req.body.status === "Delivered") {
    order.deliveredAt = Date.now();
  }

  order.save();

  res.status(200).json({
    success: true,
    order,
  });
});

async function updateStock(id, quantity) {
  const product = await Product.findById(id);

  product.Stock -= quantity;

  product.save();
}

// Update Order Status -- (Admin)
exports.deletOrder = catchAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new Errorhandlers("Order not found with this id", 404));
  }

  await order.remove();

  res.status(200).json({
    success: true,
    message:"Deleted successfully"
  });
});
