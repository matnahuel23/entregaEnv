const express = require('express');
const router = express.Router();
const path = require('path');
const uploader = require('../utils/multerUtil')
// Mongoose
const {productModel} = require('../models/productmodel')
const usermodel = require('../models/usermodel')
// Array de productos
const products = []

// Ruta para obtener todos los productos con filtros
router.get('/api/products', async (req, res) => {
    try {
        const { sort, category, status, page, limit } = req.query;
        
        // Parsea el valor de sort a un número entero
        const priceSort = sort ? parseInt(sort) : 1;

        // Define las condiciones de búsqueda
        const conditions = {};

        // Agrega la condición de filtrado por categoría si se proporciona
        if (category) {
            conditions.category = category;
        }

        // Agrega la condición de filtrado por status si se proporciona
        if (status !== undefined) {
            conditions.status = status === 'true'; // Convierte el valor a booleano
        }

        // Realiza la consulta utilizando paginate()
        const options = {
            page: page || 1, // Página actual
            limit: limit || 10, // Cantidad de resultados por página
            sort: { price: priceSort }, // Ordenar por precio
        };
        const products = await productModel.paginate(conditions, options);
        res.send({result: "sucess", payload: products})
    } catch (error) {
        res.status(500).send({ status: "error", error: 'Error al mostrar productos. Detalles: ' + error.message });
    }
});

// Ruta para la vista HBS
router.get('/products', async (req, res) => {
    try {
        const { sort, category, status, page, limit } = req.query;
        const priceSort = sort ? parseInt(sort) : 1;
        const conditions = {};
        if (category) {
            conditions.category = category;
        }
        if (status !== undefined) {
            conditions.status = status === 'true';
        }
        const options = {
            page: page || 1,
            limit: limit || 12, // puse 12 en lugar de 10 para verlo mas prolijo, ya que los acomodo de a 3
            sort: { price: priceSort },
        };
        let products = await productModel.paginate(conditions, options);
        const viewPath = path.join(__dirname, '../views/products.hbs');
        const { first_name, email, age } = req.session.user;
        res.render(viewPath, { products, first_name, email, age})
    } catch (error) {
        res.status(500).send({ status: "error", error: 'Error al obtener los productos. Detalles: ' + error.message });
    }
});

// Ruta para obtener un producto por Title
router.get('/api/products/search:title', async (req, res) => {
    try {
        let { title } = req.query
        let product = await productModel.findOne({ title })
        if (!product) {
            res.send({ status: "error", error: 'Producto no encontrado.' });
        } else {
            res.send({ result: "success", payload: product });
        }
    } catch (error) {
        res.send({ status: "error", error: 'Error al obtener el producto.' });
    }
});

// Ruta para obtener un producto por id
router.get('/api/products/:pid', async (req, res) => {
    try {
        let {pid} = req.params;
        let product = await productModel.find({_id: pid})
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
            return res.status(400).send({ status: "error", error: 'Todos los campos obligatorios deben ser proporcionados.' });
        }

        const thumbnailFilename = req.file ? req.file.filename : null;
        const thumbnails = thumbnailFilename ? [thumbnailFilename] : [];

        // Agregar el producto en la base de datos
        let result = await productModel.create({
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
    } catch (error) {
        res.status(500).send({ status: "error", error: 'Error al agregar el producto. Detalles: ' + error.message });
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
        let result = await productModel.updateOne({_id: pid}, productToReplace)
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
        let result = await productModel.deleteOne({_id: pid})
        res.send({ result: "success", message: 'Producto eliminado correctamente.', payload: result })      
    } catch (error) {
        res.send({ status: "error", error: 'Error al eliminar el producto.' });
    }
});

router.get('/realtimeproducts', async (req, res) => {
    try {
        let products = await productModel.find()
        const viewPath = path.join(__dirname, '../views/realtimeproducts.hbs');
        res.render(viewPath, { products });
    } catch (error) {
        res.send({status:"error", error: 'Error al obtener los productos.' });
    }
});

router.get('/admin', async (req, res) => {
    try {
        const viewPath = path.join(__dirname, '../views/admin.hbs');
        const { first_name, email, age } = req.session.user;
        res.render(viewPath, { products, first_name, email, age})
    } catch (error) {
        res.status(500).json({ error: 'Error en el ingreso al admin.' });
    }
});

//exporto el router
module.exports = { router, products };