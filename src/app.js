const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const { Server } = require('socket.io');
const handlebars = require('express-handlebars');
const Swal = require('sweetalert2');
const Contenedor = require('./manager/product.manager');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const productsRouter = require('./routes/products.router')

app.engine("handlebars", handlebars.engine())
app.set('views', path.join(__dirname, 'views'));
app.set("view engine", "handlebars");
app.use(express.static(path.join(__dirname, 'public')));

//Rutas
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/', productsRouter.router)

//*********************************************************/


app.get("/", (req, res) => {
    res.render("index.hbs");
})

const users = {}

io.on("connection", (socket) => {
    socket.on("newUser", (username) => {
        users[socket.id] = username;
        console.log(`Un usuario se ha conectado`);
        io.emit("userConnected", username)
    })


    const productsJsonPath = path.join(__dirname, 'data', 'products.json');
    socket.on('addProduct', async (product) => {
        try {
            const contenedor = new Contenedor(productsJsonPath);    
                const newProductId = await contenedor.save(product);
                const newProduct = { id: newProductId, ...product };
                io.emit('productAdded', newProduct);
            } catch (error) {
                console.error('Error al agregar el producto:', error);
            }
    });
    socket.on("deleteProduct", async (productId) => {
        try {
            // Eliminar el producto por ID
            await contenedor.deleteById(productId);
            // Emitir evento de producto eliminado al cliente
            io.emit('productDeleted', productId);
        } catch (error) {
            console.error('Error al eliminar el producto:', error);
        }
    });

    socket.on("disconnect", () => {
        const username = users[socket.id];
        console.log(`Un usuario ${username} se ha desconectado`);
        delete users[socket.id];
        io.emit("userDisconnected", username)
    })
})

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})