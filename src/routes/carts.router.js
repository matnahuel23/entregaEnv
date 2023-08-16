const express = require('express');
const router = express.Router();
const Contenedor = require('../manager/contenedor')
const contenedor = new Contenedor('../data/carts.json')
const path = require('path');
const {products } = require('./products.router')

// Array de carritos
const carts = []

// Ruta para obtener todos los carritos
router.get('/api/carts', async (req, res) => {
    try {
        const carts = await contenedor.getAll();
        res.json(carts);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los carritos.' });
    }
});

// Ruta para obtener un carrito por id
router.get('/api/carts/:pid', async (req, res) => {
    try {
        const pid = req.params.pid;
        const cart = await contenedor.getById(pid);
        if (!cart) {
            return res.status(404).json({ error: 'Carrito no encontrado.' });
        }
        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el carrito.' });
    }
});

// Ruta para agregar un nuevo carrito
router.post('/api/carts', async (req, res) => {
    try {
        const newCart = {
            products : [],
        }    
        const newCartId = await contenedor.save(newCart);  // El ID se generará automáticamente en la función save
        res.json({ message: 'Carrito agregado correctamente.', product: { id: newCartId, ...newCart } });
    } catch (error) {
    res.status(500).json({ error: 'Error al agregar el carrito.' });
}
});

router.post('/api/carts/:cid/product/:pid', (req, res) => {
    const cid = req.params.cid;
    const pid = req.params.pid;
    const { quantity } = req.body;
    // Buscamos el carrito por su ID
    const cart = carts.find((cart) => cart.id === cid);
    if (!cart) {
        return res.status(404).json({ error: 'Carrito no encontrado.' });
    }
      // Verificamos si el producto existe en products.router.products
    const product = products.find((product) => product.id === pid);
    if (!product) {
        return res.status(404).json({ error: 'Producto no encontrado.' });
    }
    // Verificamos si el producto ya existe en el carrito
    const existingProduct = cart.products.find((item) => item.product === pid);
    if (existingProduct) {
        existingProduct.quantity += quantity || 1;
    } else {
        // Agregamos el producto al arreglo "products" del carrito con la cantidad
        cart.products.push({ product: pid, quantity: quantity || 1 });
    }
    return res.json({ message: 'Producto agregado al carrito correctamente.' });
  });
  
//exporto el router
module.exports = {router};