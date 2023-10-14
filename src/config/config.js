const dotenv = require ('dotenv')

dotenv.config()

module.exports = {
    port: process.env.PORT,
    mongoUrl: process.env.MONGO_URL,
    adminName: process.env.ADMIN_NAME,
    adminPass: process.env.ADMIN_PASSWORD,
    cookiePass: process.env.COOKIE_PASSWORD,
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL
}