const express = require('express');
const router = express.Router();
const User = require('../models/usermodel');
const passport = require('passport');
const { createHash, isValidatePassword } = require('../utils/bcrypt')
const admin = "adminCoder@coder.com"

router.get('/register', (req, res) => {
    res.render('register.hbs')
});

router.post('/register', (req, res, next) => {
    passport.authenticate('register', { failureRedirect: '/failregister' })(req, res, next);
}, async (req, res) => {
    let { first_name, last_name, email, age, password } = req.body;
    if (!first_name || !last_name || !email || !age || !password) {
        return res.status(400).send('Faltan datos.');
    }
    try {
        let user = {
            first_name,
            last_name,
            email,
            age,
            password: createHash(password)
        };
        delete user.password
        res.redirect('/profile');
    } catch (error) {
        return res.status(500).send('Error al registrar usuario.');
    }
});

router.get('/failregister', async (req, res) => {
    res.send({ error: "Fallo el registro" });
});

router.post('/login', passport.authenticate('login', { failureRedirect: '/faillogin' }), async (req, res) => {
    if (!req.user) {
        return res.status(400).send({ status: "error", error: "Credenciales inválidas" });
    }
    req.session.user = {
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        age: req.user.age,
        email: req.user.email
    };
    // Verificar si el usuario es administrador
    if (req.user.email === admin) {
        req.session.admin = true;
        return res.redirect('/privado');
    } else {
        req.session.admin = false;
        res.redirect('/profile');
    }
});

router.get('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).send({ status: "error", error: "Valores incorrectos" });
    }
    const user = User.findOne({ email: email }, { email: 1, first_name: 1, last_name: 1 , password: 1 });
    if (!user) {
        return res.status(400).send({ status: "error", error: "Usuario no encontrado" });
    }
    if (!isValidatePassword(user, password)) {
        return res.status(403).send({ status: "error", error: "Contraseña incorrecta" });
    }
    req.session.user = user;
    const isAdmin = user.email === admin
    if(isAdmin){
        req.session.admin = true
        res.redirect('/privado')
    }else{
        req.session.admin = false;
    }
    res.redirect('/profile');
});

router.get('/faillogin', (req, res) => {
    res.redirect('/')
});

// Creo middleware de autentificación para permitir seguir como ADMIN
function auth(req, res, next) {
    if (req.session?.admin) {
        return next();
    }
    return res.status(401).send('Error de autorización');
}

// Acceso solo del administrador
router.get('/privado', auth, (req, res) => {
    res.send('Si estás viendo esto es porque ya te logueaste como administrador');
});

router.get('/profile', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/');
    }
    const { first_name, last_name, email, age } = req.session.user;
    res.render('profile.hbs', { first_name, last_name, email, age });
});

router.get('/session', (req, res) => {
    if (req.session.counter) {
        req.session.counter++;
        res.send(`Se ha visitado el sitio ${req.session.counter} veces`);
    } else {
        req.session.counter = 1;
        res.send('¡Bienvenido!');
    }
});

router.post('/restore', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send({ status: "error", error: "Correo electrónico y nueva contraseña requeridos" });
    }

    try {
        // Actualiza la contraseña en la base de datos usando el correo electrónico
        const updatedUser = await User.findOneAndUpdate(
            { email: email },
            { password: createHash(password) },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).send({ status: "error", error: "Usuario no encontrado" });
        }

        // Actualiza la información de usuario en la sesión
        req.session.user = updatedUser;
        res.redirect('/'); // Redirecciona de nuevo a la página de inicio de sesión
    } catch (error) {
        console.error(error);
        return res.status(500).send({ status: "error", error: "Error al actualizar la contraseña" });
    }
});

router.get('/restore', (req, res) => {
    const email = req.query.email || ''
    res.render('restore.hbs', { email })
});

router.get('/logout', (req, res) => {
    // El destroy elimina datos de sesión
    req.session.destroy(err => {
        if (!err) {
            res.redirect('/');
        } else {
            res.send({ status: 'Logout ERROR', body: err });
        }
    });
});

// LOGIN por medio de GitHub
/* Este es el link que llama desde el front, pasa por el middleware de passport-github2
*  pedira autorizacion a acceder al perfil,
*  cuando acceda, passport enviara la info hacia el callback
*/
router.get('/github', passport.authenticate('github', {scope:['user:email']}, async(req, res) => {}))
/**
 * Este callback TIENE QUE COINCIDIR con el que setee en la app de github, éste se encargará 
 * de hacer la redirección final a ña ventana Home
 * una vez que el login haya logrado establecer la sesión
 */
router.get('/githubcallback', passport.authenticate('github',{failureRedirect:'login'}), async(req,res) => {
    // Nuestra estrategia nos devolvera al usuario, solo lo agregamos a nuestro objeto de sesión.
    req.session.user = req.user
    res.redirect('/profile');
})

module.exports = router;