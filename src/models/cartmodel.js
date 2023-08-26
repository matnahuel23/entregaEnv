const mongoose = require('mongoose');

const cartProductSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto' },
    quantity: { type: Number, required: true },
});

const cartSchema = new mongoose.Schema({
    products: [cartProductSchema],
    total: { type: Number, required: true, default: 0 },
});

const cartModel = mongoose.model('Carrito', cartSchema);

module.exports = { cartModel };
