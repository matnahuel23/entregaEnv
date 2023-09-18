const express = require('express');
const router = express.Router();
const path = require('path');

// Ruta para obtener todos los productos
router.get('/chat', async (req, res) => {
    try {
        const viewPath = path.join(__dirname, '../views/chat.hbs');
        const { first_name} = req.session.user;
        res.render(viewPath, { first_name})
    } catch (error) {
        res.status(500).json({ error: 'Error en el chat.' });
    }
});

//exporto el router
module.exports = { router };