const mongoose = require('mongoose');

const cartCollection = "carritos";

const cartProductSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto' }, // Referencia al modelo 'Producto'
    quantity: { type: Number, required: true, default: 1 },
});

const cartSchema = new mongoose.Schema({
    products: [cartProductSchema], // Un array de productos con sus cantidades
    total: { type: Number, required: true, default: 0 },
});

const cartModel = mongoose.model(cartCollection, cartSchema);

module.exports = { cartModel };
