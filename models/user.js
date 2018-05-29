'use strict'

var moongose = require('mongoose');
var Schema = moongose.Schema;
var UserSchema = Schema({
    name: String,
    surname: String,
    nick: String,
    password: String,
    role: String,
    email: String,
    image: String
});

module.exports = moongose.model('User', UserSchema);