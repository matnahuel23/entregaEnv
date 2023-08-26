const express = require('express');
const router = express.Router();
const path = require('path');
const uploader = require('../utils/multerUtil')
// Mongoose
const {userModel} = require('../models/productmodel')

// Array de productos
const products = []

// Ruta para obtener todos los productos
router.get('/api/products', async (req, res) => {
    try {
        let products = await userModel.find()
        res.send({result:"success", payload:products})
    } catch (error) {
        res.send({status:"error", error: 'Error al obtener los productos.' });
    }
});

// Ruta para obtener un producto por id
router.get('/api/products/:pid', async (req, res) => {
    try {
        let {pid} = req.params;
        let product = await userModel.find({_id: pid})
        if (!product) {
             res.send({status:"error", error: 'Producto no encontrado.' });
        }
        res.send({result:"success", payload:product})
    } catch (error) {
        res.send({status:"error", error: 'Error al obtener el producto.' });
    }
});

// Ruta para agregar un nuevo producto
router.post('/api/products', uploader.single('thumbnails'), async (req, res) => {
    try {
        let { title, description, code, price, stock, category } = req.body;
        if (!title || !description || !code || !price || !stock || !category) {
            res.send({ status: "error", error: 'Todos los campos obligatorios deben ser proporcionados.' });
        } else {
            const thumbnailFilename = req.file ? req.file.filename : null;
            const thumbnails = thumbnailFilename ? [thumbnailFilename] : [];
            let result = await userModel.create({
                title,
                description,
                code,
                price,
                status: true,
                stock,
                category,
                thumbnails
            });
            res.send({ result: "success", payload: result });
        }
    } catch (error) {
        res.send({ status: "error", error: 'Error al agregar el producto.' });
    }
});

// Ruta para actualizar un producto por su ID (PUT /:pid)
router.put('/api/products/:pid', async (req, res) => {
    try {
        let {pid} = req.params;
        const productToReplace = req.body;
        // Validamos que se proporcionen campos para actualizar
        if (Object.keys(productToReplace).length === 0) {
            return res.send({ status:"error", error: 'Debe proporcionar al menos un campo para actualizar.' });
        }
        let result = await userModel.updateOne({_id: pid}, productToReplace)
        if (!result) {
            return res.send({ status:"error", error: 'Producto no encontrado.' });
        }
        // Actualizamos los campos del producto encontrado
        res.send({ result: "success", payload: result })
    } catch (error) {
        res.send({ status:"error", error: 'Error al actualizar el producto.' });
    }
});

// Ruta para eliminar un producto por su ID (DELETE /:pid)
router.delete('/api/products/:pid', async (req, res) => {
    try {
        let {pid} = req.params;
        let result = await userModel.deleteOne({_id: pid})
        res.send({ result: "success", message: 'Producto eliminado correctamente.', payload: result })      
    } catch (error) {
        res.send({ status: "error", error: 'Error al eliminar el producto.' });
    }
});

router.get('/realtimeproducts', async (req, res) => {
    try {
        let products = await userModel.find()
        const viewPath = path.join(__dirname, '../views/realtimeproducts.hbs');
        res.render(viewPath, { products });
    } catch (error) {
        res.send({status:"error", error: 'Error al obtener los productos.' });
    }
});

//exporto el router
module.exports = { router, products };