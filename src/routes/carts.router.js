const express = require('express');
const router = express.Router();
const { products} = require('./products.router');

// Array de carritos
const carts = [];

// Ruta para obtener todos los carritos
router.get('/api/carts', (req, res) => {
  res.json({ carts })
});

// Ruta para crear un nuevo carrito (POST /api/carts)
router.post('/api/carts', (req, res) => {
    const newCart = {
        id: generateUniqueId(), // Generar ID único para el carrito
        products: [] // Inicialmente, el carrito estará vacío
    };
    carts.push(newCart);
    res.json({ message: 'Carrito creado correctamente.', cart: newCart });
});

// Ruta para obtener los productos de un carrito por su ID (GET /api/carts/:cid)
router.get('/api/carts/:cid', (req, res) => {
    const cid = req.params.cid;
    const cart = carts.find((cart) => cart.id === cid);
    if (!cart) {
        return res.status(404).json({ error: 'Carrito no encontrado.' });
    }
    return res.json({ products: cart.products });
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

// Función para generar un ID único
function generateUniqueId() {
    return Date.now().toString();
}

// Exportar el router
module.exports = router; 