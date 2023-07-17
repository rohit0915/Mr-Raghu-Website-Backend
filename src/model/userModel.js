const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    confirmEmail: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    residence: {
        type: String,
        required: true
    },
    profession: {
        type: String,
        required: true
    },
    userType: {
        type: String,
        enum: ["Admin", "User"],
        default: "User"
    }

},{timestamps: true})

const user = mongoose.model('User', userSchema);


module.exports = user;
