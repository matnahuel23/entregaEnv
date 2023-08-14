const express = require('express');
const router = express.Router();

// Array de productos
const products = []

// Ruta para obtener todos los productos
router.get('/api/products', (req, res) => {
    res.json({ products })
});

// Ruta para obtener un producto por id
router.get('/api/products/:pid', (req, res) => {
    const pid = req.params.pid
    const product = products.find((product) => product.id === pid)
    if (!product) {
        return res.status(404).json({ error: 'Producto no encontrado.' })
    }
    return res.json(product);
});


// Funcion para generar id Unico
function generateUniqueId() {
    return Date.now().toString();
}

// Ruta para agregar un nuevo producto
router.post('/api/products', (req, res) => {
    const { title, description, code, price, stock, category, thumbnails } = req.body;
    // Validar que todos los campos obligatorios estén presentes
    if (!title || !description || !code || !price || !stock || !category) {
        return res.status(400).json({ error: 'Todos los campos obligatorios deben ser proporcionados.' });
    }
    const id = generateUniqueId();
    const newProduct = {
        id,
        title,
        description,
        code,
        price,
        status: true, // Status es true por defecto
        stock,
        category,
        thumbnails: thumbnails || [] // Si no se proporciona, thumbnails es un array vacío
    };
    products.push(newProduct);
    res.json({ message: 'Producto agregado correctamente.', product: newProduct });
});

// Ruta para actualizar un producto por su ID (PUT /:pid)
router.put('/api/products/:pid', (req, res) => {
    const pid = req.params.pid; // No es necesario convertirlo a número aquí
    const updateFields = req.body;
    // Validamos que se proporcionen campos para actualizar
    if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({ error: 'Debe proporcionar al menos un campo para actualizar.' });
    }
    const productToUpdate = products.find((product) => product.id === pid);
    if (!productToUpdate) {
        return res.status(404).json({ error: 'Producto no encontrado.' });
    }
    // Actualizamos los campos del producto encontrado
    Object.assign(productToUpdate, updateFields);
    return res.json(productToUpdate);
});


// Ruta para eliminar un producto por su ID (DELETE /:pid), utilizo el findIndex
router.delete('/api/products/:pid', (req, res) => {
    const pid = req.params.pid; // No es necesario convertirlo a número aquí
    const productIndex = products.findIndex((product) => product.id === pid);
    if (productIndex === -1) {
        return res.status(404).json({ error: 'Producto no encontrado.' });
    }
    const deletedProduct = products.splice(productIndex, 1);
    return res.json(deletedProduct[0]);
});

//exporto el router
module.exports = { router, products };