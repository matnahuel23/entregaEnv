const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2')

const cartProductSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'productos' },
    quantity: { type: Number, required: true },
},{ _id: false });

const cartSchema = new mongoose.Schema({
    products: [cartProductSchema],
    total: { type: Number, required: true, default: 0 },
},{ versionKey: false });

cartSchema.plugin(paginate);

const cartModel = mongoose.model('Carrito', cartSchema);

module.exports = { cartModel };
