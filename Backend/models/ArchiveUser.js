const mongoose = require('mongoose');
// const validator = require('validator');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const crypto = require('crypto');

const userarchiveSchema = new mongoose.Schema({
     name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        required: true,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    street: {
        type: String,
        default: ''
    },
    apartment: {
        type: String,
        default: ''
    },
    zip: {
        type: String,
        default: ''
    },
    city: {
        type: String,
        default: ''
    },
    country: {
        type: String,
        default: ''
    },
    isOnline: { 
        type: Boolean, 
        default: false 
    },
    pushToken: { 
        type: String, 
        default: null 
    },

});

userarchiveSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

userarchiveSchema.set('toJSON', {
    virtuals: true,
});
exports.UserArchive = mongoose.model('UserArchive', userarchiveSchema);