const express = require('express');
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
const MongoStore = require('connect-mongo');
const session = require('express-session');
const bodyParser = require('body-parser');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const handlebars = require('express-handlebars');
const Contenedor = require('./manager/contenedor');
const cartsJsonPath = path.join(__dirname, 'data', 'carts.json');
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 8080;
const passport = require('passport')
const initializePassport = require('./config/passport.config')
const mongoURL = 'mongodb+srv://matiasierace:bestoso77@cluster0.132340f.mongodb.net/ecommerce?retryWrites=true&w=majority'

app.use(session({
    store: MongoStore.create({
        mongoUrl: mongoURL,
        mongoOptions: { useNewUrlParser: true, useUnifiedTopology: true },
        ttl: 6000,
    }),
    secret: 'adminCod3r123',
    // resave en false hace que la sesión muera luego de un tiempo, si quiero que quede activa le pongo true
    resave: false,
    // saveUninitialized en true guarda sesión aun cuando el objeto de sesión no tenga nada por contener
    saveUninitialized: true,
}));
initializePassport();
app.use(passport.initialize())
app.use(passport.session())
//mongoose**********************************/
mongoose.connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
//Routes
const productsRouter = require('./routes/products.router')
const cartsRouter = require('./routes/carts.router')
const chatRouter = require('./routes/chat.router')
const sessionsRouter = require('./routes/sessions')
const cookieRouter = require('./routes/cookie.router')
app.engine("handlebars", handlebars.engine())
app.set('views', path.join(__dirname, 'views'));
app.set("view engine", "handlebars");
app.use(express.static(path.join(__dirname, 'public')));
//Cookie
app.use(cookieParser("CoderS3cR3tC0D3")) // Con firma

//Rutas a vistas
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/', sessionsRouter)
app.use('/', cookieRouter)
app.use('/', productsRouter.router)
app.use('/', cartsRouter.router)
app.use('/', chatRouter.router)
app.use(bodyParser.urlencoded({ extended: true }));
app.get('/', (req, res) => {
    res.render('login.hbs')     
})
//

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
            // Emitir el evento a todos los clientes conectados
            io.emit("productAdded", product);
            } catch (error) {
                console.error('Error al agregar el producto:', error);
            }
    });
    
    socket.on('deleteProduct', async (deletedProductId) => {
        try {
            // Emitir el evento a todos los clientes conectados
            io.emit('productDeleted', deletedProductId);
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

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});