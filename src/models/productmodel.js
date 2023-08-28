const mongoose = require('mongoose')

const productCollection = "productos"

const productSchema = new mongoose.Schema({
    title:{ type: String, required: true, max:100 },
    description:{ type: String, required: true, max:200 },
    code:{ type: Number, required: true},
    price:{ type: Number, required: true },
    status:{ type: Boolean, required: true },
    stock:{ type: Number, required: true, max:100 },
    category:{ type: String, required: true },
    thumbnails:{ type: Array, required: false},
},{ versionKey: false });

const productModel = mongoose.model(productCollection, productSchema)

module.exports = {productModel}