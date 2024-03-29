'use strict'

var express = require('express');
var UserController = require('../controllers/user');
var md_auth = require('../middleware/autentificacion');
var api = express.Router();
var multipart = require('connect-multiparty');
var md_upload = multipart({ uploadDir: './uploads/users' });


api.get('/home', UserController.Home);
api.get('/prueba', md_auth.ensureAuth, UserController.pruebas);
api.post('/register', UserController.saveUser);
api.post('/login', UserController.LoginUser);
api.get('/user/:id', md_auth.ensureAuth, UserController.getUser);
api.get('/users/:page?', md_auth.ensureAuth, UserController.getUsers);
api.get('/counters/:id?', md_auth.ensureAuth, UserController.getCounter)
api.put('/update-user/:id', md_auth.ensureAuth, UserController.UpdateUser);
api.post('/upload-image-user/:id', [md_auth.ensureAuth, md_upload], UserController.uploadImage);
api.get('/get-image-user/:imageFile', UserController.getImageFile)
module.exports = api;