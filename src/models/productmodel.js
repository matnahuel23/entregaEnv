const mongoose = require('mongoose')

const userCollection = "productos"

const userSchema = new mongoose.Schema({
    title:{ type: String, required: true, max:100 },
    description:{ type: String, required: true, max:200 },
    code:{ type: Number, required: true, max:10 },
    price:{ type: Number, required: true, max:10 },
    status:{ type: Boolean, required: true },
    stock:{ type: Number, required: true, max:100 },
    category:{ type: String, required: true, max:100 },
    thumbnails:{ type: String, required: false, max:100 },
})

const userModel = mongoose.model(userCollection, userSchema)

module.exports = {userModel}