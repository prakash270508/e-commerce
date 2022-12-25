const Product = require("../models/productModel");
const Errorhandlers = require("../utils/errorHandlers");
const catchAsyncError = require("../middleware/asyncError");
const ApiFeature = require("../utils/apiFeatures");


//Create Products --Admin

exports.createProduct = catchAsyncError(async (req, res, next) => {

    const product = await Product.create(req.body)

    res.status(201).json({
        success: true,
        message:"Product created Successfully",
        product
    })

    product.save();

});

//Get All Products
exports.getAllproduct = catchAsyncError(async (req, res, next) => {

    const productCount = await Product.countDocuments()

    const resultPerPage = 5;

    const apiFeature = new ApiFeature(Product.find(), req.query).search().pagination(resultPerPage);

    const products = await apiFeature.query;

    res.status(200).json({
        success: true,
        productCount,
        products
    })

})

//Get productDetails
exports.getProductDetails = catchAsyncError(async (req, res, next) => {

    let product = await Product.findById(req.params.id);

    if (!product) {
        return next(new Errorhandlers("Product not found", 400))
    }

    res.status(200).json({
        success: true,
        product
    })

})


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
        return next(new Errorhandlers("Product not found", 500))
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    })

    res.status(200).json({
        success: true,
        product
    })
})

//Delete Product
exports.deleteProduct = catchAsyncError(async (req, res) => {

    let product = await Product.findById(req.params.id);

    if (!product) {
        return next(new Errorhandlers("Product not found", 500))
    }

    await product.remove();

    res.status(200).json({
        success: true,
        message: "Product delete succesfully"
    })
})