'use strict'

var express = require('express');
var publicationController = require('../controllers/publication');
var md_auth = require('../middleware/autentificacion');
var api = express.Router();
var multipart = require('connect-multiparty');
var md_upload = multipart({ uploadDir: './uploads/publication' });

api.get('/probando-pub', md_auth.ensureAuth, publicationController.probando);
api.post('/publication', md_auth.ensureAuth, publicationController.savePublication);
api.get('/publications/:page?', md_auth.ensureAuth, publicationController.getPublications);
api.get('/publication/:id', md_auth.ensureAuth, publicationController.getPublication);
api.delete('/publication/:id', md_auth.ensureAuth, publicationController.deletePublication);
api.post('/upload-image-pub/:id', [md_upload, md_auth.ensureAuth], publicationController.uploadImage);
api.get('/get-image-pub/:pubFile', publicationController.getImageFile)



module.exports = api;