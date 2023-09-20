const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    first_name:{type: String},
    last_name: {type: String},
    email: {type: String},
    age: {type: Number},
    role:{ type: String, enum: ["user", "admin"], default: "user"},
    password: { type: String }, 
},{ versionKey: false });

const User = mongoose.model('Usuario', userSchema);

module.exports = User;