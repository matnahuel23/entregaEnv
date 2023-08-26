const mongoose = require('mongoose')

const productCollection = "usuarios"

const productSchema = new mongoose.Schema({
    nombre:{ type: String, required: true, max:100 },
    apellido:{ type: String, required: true, max:100 },
    email:{ type: String, required: true, max:50 },
})

const userModel = mongoose.model(productCollection, productSchema)

module.exports = {userModel}