const express = require('express');
const router = express.Router();
const Contenedor = require('../manager/product.manager')
const contenedor = new Contenedor('../data/products.json')
const path = require('path');

// Array de productos
const products = []

// Ruta para obtener todos los productos
router.get('/api/products', async (req, res) => {
    try {
        const products = await contenedor.getAll();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los productos.' });
    }
});

// Ruta para obtener un producto por id
router.get('/api/products/:pid', async (req, res) => {
    try {
        const pid = req.params.pid;
        const product = await contenedor.getById(pid);
        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado.' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el producto.' });
    }
});

// Ruta para agregar un nuevo producto
router.post('/api/products', async (req, res) => {
    try {
        const { title, description, code, price, stock, category, thumbnails } = req.body;
        if (!title || !description || !code || !price || !stock || !category) {
            return res.status(400).json({ error: 'Todos los campos obligatorios deben ser proporcionados.' });
        }
        const newProduct = {
            title,
            description,
            code,
            price,
            status: true,
            stock,
            category,
            thumbnails: thumbnails || []
        };
        const newProductId = await contenedor.save(newProduct);  // El ID se generará automáticamente en la función save
        res.json({ message: 'Producto agregado correctamente.', product: { id: newProductId, ...newProduct } });
    } catch (error) {
        res.status(500).json({ error: 'Error al agregar el producto.' });
    }
});

// Ruta para actualizar un producto por su ID (PUT /:pid)
router.put('/api/products/:pid', async (req, res) => {
    try {
        const pid = req.params.pid;
        const updateFields = req.body;
        // Validamos que se proporcionen campos para actualizar
        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ error: 'Debe proporcionar al menos un campo para actualizar.' });
        }
        // Usamos el método getById para obtener el producto
        const productToUpdate = await contenedor.getById(pid);
        if (!productToUpdate) {
            return res.status(404).json({ error: 'Producto no encontrado.' });
        }
        // Actualizamos los campos del producto encontrado
        Object.assign(productToUpdate, updateFields);
        // Guardamos la actualización en el archivo
        await contenedor.save(productToUpdate);
        res.json(productToUpdate);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el producto.' });
    }
});

// Ruta para eliminar un producto por su ID (DELETE /:pid)
router.delete('/api/products/:pid', async (req, res) => {
    try {
        const pid = req.params.pid;
        await contenedor.deleteById(pid);        
        res.json({ message: 'Producto eliminado correctamente.' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el producto.' });
    }
});

router.get('/realtimeproducts', async (req, res) => {
    try {
        const products = await contenedor.getAll();
        const viewPath = path.join(__dirname, '../views/realtimeproducts.hbs');
        res.render(viewPath, { products });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los productos.' });
    }
});

//exporto el router
module.exports = { router, products };