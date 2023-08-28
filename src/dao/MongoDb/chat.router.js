const express = require('express');
const router = express.Router();
const path = require('path');

// Ruta para obtener todos los productos
router.get('/chat', async (req, res) => {
    try {
        const viewPath = path.join(__dirname, '../views/chat.hbs');
        res.render(viewPath);
    } catch (error) {
        res.status(500).json({ error: 'Error en el chat.' });
    }
});

//exporto el router
module.exports = { router };