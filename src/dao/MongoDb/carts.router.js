const express = require('express');
const router = express.Router();
const path = require('path');
const {cartModel} = require('../../models/cartmodel')
const {productModel} = require('../../models/productmodel')

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

// Ruta para la vista .HBS
router.get('/cart/:cartId', async (req, res) => {
    try {
        const { cartId } = req.params;
        const cart = await cartModel.findById(cartId).populate('products.product');
        if (!cart) {
            return res.status(404).send({ status: 'error', error: 'Carrito no encontrado.' });
        }
        let total = 0;
        for (const item of cart.products) {
            total += item.product.price * item.quantity;
        }
        const viewPath = path.join(__dirname, '../../views/cart.hbs');
        res.render(viewPath, { cart, total });
    } catch (error) {
        res.status(500).send({ status: 'error', error: 'Error al obtener el carrito.' });
    }
});

// Ruta para obtener un carrito por id
router.get('/api/cart/:cid', async (req, res) => {
    try {
        let {cid} = req.params;
        let cart = await cartModel.findById({_id: cid}).populate('products.product'); // Utiliza populate
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
        res.status(500).send({ status: "error", error: 'Error al agregar el carrito.' });
    }
});

// Ruta para agregar uno o varios productos a un carrito existente
router.put('/api/cart/:cid/product/:pid', async (req, res) => {
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
        await cartModel.updateOne({ _id: cid }, cartAdd);
        await productModel.updateOne({ _id: pid }, { $inc: { stock: -quantity } });
        // Actualiza el total del carrito
        await cartModel.updateOne({ _id: cid }, { $inc: { total: product.price * quantity } });
        return res.json({ message: 'Producto agregado al carrito correctamente.' });
    } catch (error) {
        return res.status(500).json({ message: 'Error al agregar el producto.' });
    }
});

// Ruta para actualizar un carrito con un arreglo de productos
router.put('/api/cart/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const { products } = req.body.payload;
        
        // Buscar el carrito por su ID
        const cart = await cartModel.findById(cid);

        if (!cart) {
            return res.status(404).json({ status: 'error', error: 'Carrito no encontrado.' });
        }

        // Limpiar los productos existentes en el carrito
        cart.products = [];

        // Inicializar el total del carrito
        let total = 0;

        // Iterar sobre el arreglo de productos y agregar cada producto al carrito
        for (const product of products) {
            const { _id, quantity } = product;
            const productData = await productModel.findById(_id);

            if (!productData) {
                return res.status(404).json({ status: 'error', error: 'Producto no encontrado.' });
            }

            // Verificar si hay suficiente stock para la cantidad solicitada
            if (productData.stock < quantity) {
                return res.status(400).json({ status: 'error', error: 'No disponemos de ese stock.' });
            }

            // Agregar el producto al carrito
            cart.products.push({
                product: _id,
                quantity: quantity,
            });

            // Actualizar el stock del producto
            await productModel.updateOne({ _id: _id }, { $inc: { stock: -quantity } });

            // Calcular el subtotal para el producto y agregarlo al total del carrito
            const productSubtotal = productData.price * quantity;
            total += productSubtotal;
        }

        // Actualizar los productos y el total del carrito en la base de datos
        await cartModel.updateOne({ _id: cid }, { products: cart.products, total: total });

        return res.json({ result: 'success', payload: cart });
    } catch (error) {
        return res.status(500).json({ status: 'error', error: 'Error al actualizar el carrito.' });
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

            await productModel.updateOne(
                { _id: product._id },
                { $inc: { stock: quantity } }
            );
        }

        await cartModel.deleteOne({ _id: cid });
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

        await productModel.updateOne({ _id: pid }, { stock: product.stock });
        await cartModel.updateOne({ _id: cid }, cart);

        res.json({ message: 'Producto eliminado del carrito correctamente.' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el producto del carrito.' });
    }
});

//exporto el router
module.exports = {router};