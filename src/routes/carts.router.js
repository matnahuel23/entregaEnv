const express = require('express');
const router = express.Router();
const Contenedor = require('../manager/contenedor')
const contenedor = new Contenedor('../data/carts.json')
const productContenedor = new Contenedor('../data/products.json');
const path = require('path');
const { Console } = require('console');
const {cartModel} = require('../models/cartmodel')
const {productModel} = require('../models/productmodel')

// Array de carritos
const cart = []

// Ruta para obtener todos los carritos
router.get('/api/cart', async (req, res) => {
    try {
        let carts = await cartModel.find()
        res.send({result:"success", payload:carts})
    } catch (error) {
        res.send({status:"error", error: 'Error al obtener los carritos.' });
    }
});

// Ruta para obtener un carrito por id
router.get('/api/cart/:cid', async (req, res) => {
    try {
        let {cid} = req.params;
        let cart = await cartModel.findById({_id: cid})
        if (!cart) {
           res.send({status:"error", error: 'Carrito no encontrado.' });
        }
        res.send({result:"success", payload:cart})
    } catch (error) {
        res.send({status:"error", error: 'Error al obtener el carrito.' });
    }
});

// Ruta para agregar un nuevo carrito
router.post('/api/cart', async (req, res) => {
    try {
        const newCart = {
            products : [],
            total : 0,
        }    
        let result = await cartModel.create({
            newCart
        });
        res.send({ result: "success", payload: result });
    } catch (error) {
        res.status(500).send({ status: "error", error: 'Error al agregar el carritp.' });
    }
});

// Ruta para agregar uno o varios productos a un carrito existente
router.post('/api/cart/:cid/product/:pid', async (req, res) => {
    try {
        const cid = req.params.cid;
        const pid = req.params.pid;
        const quantity = parseInt(req.body.quantity);

        if (quantity <= 0) {
            return res.send({ status: "error", error: 'Debe ingresar al menos una unidad del producto.' });
        }
        const cartAdd = await cartModel.findOne({ _id: cid });
        if (!cartAdd) {
            return res.send({ status: "error", error: 'Carrito no encontrado' });
        }
        const product = await productModel.findOne({ _id: pid });
        if (!product) {
            return res.send({ status: "error", error: 'Producto no encontrado' });
        }
        if (product.stock < quantity) {
            return res.send({ status: "error", error: 'No disponemos de ese stock' });
        }
        const existingProductIndex = cartAdd.products.findIndex(item => item.product.toString() === pid);
        if (existingProductIndex !== -1) {
            cartAdd.products[existingProductIndex].quantity += quantity;
        } else {
            cartAdd.products.push({ product: pid, quantity });
        }
        cartAdd.markModified('products');
        await cartAdd.save();
        // Actualiza el stock del producto y el total del carrito
        product.stock -= quantity;
        await product.save();
        cartAdd.total += product.price * quantity;
        await cartAdd.save();
        return res.json({ message: 'Producto agregado al carrito correctamente.' });
    } catch (error) {
        return res.status(500).json({ message: 'Error al agregar el producto.' });
    }
});

// Ruta para eliminar un carrito por su ID (DELETE /api/cart/:pid)
router.delete('/api/cart/:cid', async (req, res) => {
    try {
        const cid = req.params.cid;
        const cartToRemove = await cartModel.findOne({ _id: cid });

        if (!cartToRemove) {
            return res.status(404).json({ status: "error", error: 'Carrito no encontrado' });
        }

        // Devolver las cantidades de productos al stock
        for (const cartProduct of cartToRemove.products) {
            const product = await productModel.findById(cartProduct.product);
            const quantity = cartProduct.quantity;
            product.stock += quantity;
            await product.save();
            console.log(`Stock del producto ${product._id} actualizado: ${product.stock}`);
        }
        await cartToRemove.deleteOne({_id: cid})
        return res.json({ message: 'Carrito eliminado y cantidades de productos devueltas al stock correctamente.' });
    } catch (error) {
        return res.status(500).json({ message: 'Error al eliminar el carrito.' });
    }
});

// Ruta para eliminar un producto específico de un carrito (DELETE /api/cart/:cid/product/:pid)
router.delete('/api/cart/:cid/product/:pid', async (req, res) => {
    try {
        const cid = req.params.cid;
        const pid = req.params.pid;
        const quantity = parseInt(req.body.quantity);

        if (quantity <= 0) {
            return res.status(400).json({ error: 'La cantidad debe ser mayor que 0.' });
        }

        const cart = await cartModel.findById(cid);

        if (!cart) {
            return res.status(404).json({ error: 'Carrito no encontrado.' });
        }

        const productIndex = cart.products.findIndex((item) => item.product.toString() === pid);

        if (productIndex === -1) {
            return res.status(404).json({ error: 'Producto no encontrado en el carrito.' });
        }

        const product = await productModel.findById(pid);

        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado.' });
        }

        const cartProduct = cart.products[productIndex];

        if (cartProduct.quantity < quantity) {
            return res.status(400).json({ error: 'La cantidad a eliminar es mayor que la cantidad en el carrito.' });
        }

        // Restar la cantidad del producto en el carrito
        cartProduct.quantity -= quantity;

        // Actualizar el stock del producto y el total del carrito
        product.stock += quantity;
        const productTotal = product.price * quantity;
        cart.total -= productTotal;

        if (cartProduct.quantity === 0) {
            // Si la cantidad llega a 0, eliminar el producto del carrito
            cart.products.splice(productIndex, 1);
        }

        // Guardo los cambios
        await product.save();
        await cart.save();
        res.json({ message: 'Producto eliminado del carrito correctamente.' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el producto del carrito.' });
    }
});


//exporto el router
module.exports = {router};