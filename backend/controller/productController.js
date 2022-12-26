const Product = require("../models/productModel");
const Errorhandlers = require("../utils/errorHandlers");
const catchAsyncError = require("../middleware/asyncError");
const ApiFeature = require("../utils/apiFeatures");

//Create Products --Admin

exports.createProduct = catchAsyncError(async (req, res, next) => {
  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    message: "Product created Successfully",
    product,
  });

  product.save();
});

//Get All Products
exports.getAllproduct = catchAsyncError(async (req, res, next) => {
  const productCount = await Product.countDocuments();

  const resultPerPage = 5;

  const apiFeature = new ApiFeature(Product.find(), req.query)
    .search()
    .pagination(resultPerPage);

  const products = await apiFeature.query;

  res.status(200).json({
    success: true,
    productCount,
    products,
  });
});

//Get productDetails
exports.getProductDetails = catchAsyncError(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new Errorhandlers("Product not found", 400));
  }

  res.status(200).json({
    success: true,
    product,
  });
});

//Product by Search --Traditional Method
// exports.getBySearch = catchAsyncError(
//     async(req, res, next)=>{
//         let product = await Product.find(
//             {
//                 "$or":[
//                     {name:{$regex:req.params.key}},
//                 ]
//             }
//         )

//         res.send(product);
//     }
// )

//Update Products
exports.updateProduct = catchAsyncError(async (req, res) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new Errorhandlers("Product not found", 500));
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    product,
  });
});

//Delete Product
exports.deleteProduct = catchAsyncError(async (req, res) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new Errorhandlers("Product not found", 500));
  }

  await product.remove();

  res.status(200).json({
    success: true,
    message: "Product delete succesfully",
  });
});

// Create Review or update review
exports.createProductReview = catchAsyncError(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);

  const isReviewed = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (isReviewed) {
    product.reviews.forEach((rev) => {
      if ((rev) => rev.user.toString() === req.user._id.toString()) {
        (rev.rating = rating), (rev.comment = comment);
      }
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  let avg = 0;

  product.ratings = product.reviews.forEach((rev) => {
    avg += rev.rating;
  });

  product.ratings = avg / product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    product,
  });
});

//Get all reviews of a product
exports.getproductReview = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.id);

  if (!product) {
    return next(new Errorhandlers("Product not found", 500));
  }

  res.status(200).json({
    success: true,
    review: product.reviews,
  });
});


//Delete all reviews of a product
exports.deleteReviwe = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  if (!product) {
    return next(new Errorhandlers("Product not found", 500));
  }

  const reviews = product.reviews.filter(rev =>{
    rev._id.toString() !== req.query.id.toString()
  })

  let avg = 0;

  reviews.reviews.forEach((rev) => {
    avg += rev.rating;
  });

  let ratings = 0;

  if (reviews.length === 0) {
    ratings = 0;
  } else {
    ratings = avg / reviews.length;
  }
  const numOfReviews = reviews.length;

  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );


  res.status(200).json({
    success: true,
  });
});
