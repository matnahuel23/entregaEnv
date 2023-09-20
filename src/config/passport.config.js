const passport = require("passport");
const local = require("passport-local");
const userService = require("../models/usermodel");
const { createHash, isValidatePassword } = require("../utils/bcrypt");
const GitHubStrategy = require('passport-github2')
const localStrategy = local.Strategy;
const admin = "adminCoder@coder.com"

const initializePassport = () => {
    // Configuración de la estrategia local de registro
    passport.use('register', new localStrategy(
        { passReqToCallback: true, usernameField: 'email'}, async (req, username, password, done) => {
            const { first_name, last_name, email, age } = req.body;
            try {
                let user = await userService.findOne({ email: username });
                if (user) {
                    console.log("El usuario ya existe");
                    return done(null, false);
                }
                const newUser = {
                    first_name,
                    last_name,
                    email,
                    age,
                    password: createHash(password)
                }
                if(email == admin)
                {
                    newUser.role = "admin"
                }
                let result = await userService.create(newUser)
                return done(null, result);
            } catch (error) {
                console.error("Error en el registro:", error);
                return done(error);
            }
        }
    ));
    // Serialización del usuario
    passport.serializeUser((user, done) => {
        done(null, user._id);
    });
    // Deserialización del usuario
    passport.deserializeUser(async (id, done) => {
        let user = await userService.findById(id);
        done(null, user);
    });
    // Configuración de la estrategia local de inicio de sesión
    passport.use('login', new localStrategy({ usernameField: 'email' }, async (username, password, done) => {
        try {
            const user = await userService.findOne({ email: username });
            if (!user) {
                console.log('El usuario no existe');
                return done(null, false);
            }
            if (!isValidatePassword(user, password)) {
                console.log('Contraseña incorrecta');
                return done(null, false);
            }
            return done(null, user);
        } catch (error) {
            console.error("Error en el inicio de sesión:", error);
            return done(error);
        }
    }));
    // Configuración de la estrategia de registro con GitHub, previamente instale passport-github2
    passport.use('github', new GitHubStrategy({
        clientID: "Iv1.1e44b8fedafbceae",
        clientSecret: '7d394776f813e113817fe640f4d547dd96d97774',
        callbackURL: 'http://localhost:8080/githubcallback'
    }, async(accessToken, refreshToken, profile, done) => {
        try{
            // console.log(profile) //chequeo info que viene del perfil
            let user = await userService.findOne({email:profile._json.email})
            if(!user){ // Si el usuario no existe en nuestra BD, lo agrego
                let newUser = {
                    first_name:profile._json.name,
                    last_name:'',
                    age:18,
                    email:profile._json.email,
                    password:'' // al ser autentificacion de terceros, no podemos asignar un password
                }
                let result = await userService.create(newUser)
                done(null, result)
            } else { // Si entra aca, es porque el usuario ya existia en nuestra BD
                done(null, user)
            }
        }catch(error){
            return done(error)
        }
    }))
}

module.exports = initializePassport;
