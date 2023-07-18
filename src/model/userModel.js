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
    },
    profileImage: {
        type: String,
    },
    profileName: {
        type: String,
    },
    savedCourses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      }],

},{timestamps: true})

const user = mongoose.model('User', userSchema);


module.exports = user;
