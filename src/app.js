const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const { Server } = require('socket.io');
const handlebars = require('express-handlebars');
const Swal = require('sweetalert2');
const Contenedor = require('./manager/contenedor');

const productsJsonPath = path.join(__dirname, 'data', 'products.json');
const cartsJsonPath = path.join(__dirname, 'data', 'carts.json');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
//Routes
const productsRouter = require('./routes/products.router')
const cartsRouter = require('./routes/carts.router')
const chatRouter = require('./routes/chat.router')

app.engine("handlebars", handlebars.engine())
app.set('views', path.join(__dirname, 'views'));
app.set("view engine", "handlebars");
app.use(express.static(path.join(__dirname, 'public')));

//Rutas
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/', productsRouter.router)
app.use('/', cartsRouter.router)
app.use('/', chatRouter.router)

//Mongoose


//*********************************************************/


app.get("/", (req, res) => {
    res.render("index.hbs");
})

const users = {}

io.on("connection", (socket) => {
    // Conexión y Desconexión de usuarios
    socket.on("newUser", (username) => {
        users[socket.id] = username;
        console.log(`Un usuario se ha conectado`);
        io.emit("userConnected", username)
    })
    socket.on("disconnect", () => {
        const username = users[socket.id];
        console.log(`Un usuario ${username} se ha desconectado`);
        delete users[socket.id];
        io.emit("userDisconnected", username)
    })

    // Agregar y Borrar Productos
    socket.on('addProduct', async (product) => {
        try {
                const contenedor = new Contenedor(productsJsonPath);    
                const newProductId = await contenedor.getAll();
                const newProduct = { id: newProductId, ...product };
                io.emit('productAdded', newProduct);
            } catch (error) {
                console.error('Error al agregar el producto:', error);
            }
    });
    
    socket.on('deleteProduct', async (productId) => {
        try {
            const contenedor = new Contenedor(productsJsonPath);
            await contenedor.deleteById(productId);
            io.emit('productDeleted', productId);
        } catch (error) {
            console.error('Error al eliminar el producto:', error);
        }
    });

    // Agregar y borrar Carrito 
    socket.on('addCart', async (cart) => {
        try {
                const contenedor = new Contenedor(cartsJsonPath);    
                const newCartId = await contenedor.save(cart);
                const newCart = { id: newCartId, ...cart };
                io.emit('cartAdded', newCart);
            } catch (error) {
                console.error('Error al agregar el carrito:', error);
            }
    });
    
    socket.on("deleteCart", async (cartId) => {
        try {
            const contenedor = new Contenedor(cartsJsonPath);
            await contenedor.deleteById(cartId);
            io.emit('cartDeleted', cartId);
        } catch (error) {
            console.error('Error al eliminar el carrito:', error);
        }
    });

    // Chat
    socket.on("chatMessage", (message) => {
        console.log("Mensaje ingresado");
        const username = users[socket.id];
        io.emit("message", { username, message })
    })

})

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})