const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter product name"]
    },
    description: {
        type: String,
        required: [true, "Please enter product description"]
    },
    catagory: {
        type: String,
        required: [true, "Please enter product catagory"]
    },
    price: {
        type: Number,
        required: [true, "Please enter product price"],
        maxLength: [8, "Price cannot more than 8 character"]
    },
    rating: {
        type: String,
        default: 0
    },
    image: [
        {
            public_id: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            }
        }
    ],
    
})

module.exports = mongoose.model("product", productSchema);  