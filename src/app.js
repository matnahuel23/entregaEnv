const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const { Server } = require('socket.io');
const handlebars = require('express-handlebars');
const Swal = require('sweetalert2');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const productsRouter = require('./routes/products.router')
const cartsRouter = require('./routes/carts.router')

app.engine("handlebars", handlebars.engine())
app.set("views", __dirname + "/views");
app.set("view engine", "handlebars");
app.use(express.static(path.join(__dirname, 'public')));

//Rutas
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/', productsRouter.router)
app.use('/', cartsRouter)

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


    socket.on("addProduct", (product) => {
        console.log("Product added:", product.title);
        io.emit("productAdded", product);
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