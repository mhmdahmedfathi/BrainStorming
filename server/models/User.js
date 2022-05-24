const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        minLength: 8,
        maxLength: 100,
        required: true
    }
}, { timestamps: true });




module.exports = mongoose.model('User', userSchema);