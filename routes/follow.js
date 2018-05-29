'use strict'

var express = require('express');
var followCotroller = require('../controllers/follow');
var md_auth = require('../middleware/autentificacion');
var api = express.Router();

api.post('/follow', md_auth.ensureAuth, followCotroller.SaveFollow);
api.delete('/follow/:id', md_auth.ensureAuth, followCotroller.DeleteFollow);
api.get('/following/:id?/:page?', md_auth.ensureAuth, followCotroller.GetFollowingUser);
api.get('/followed/:id?/:page?', md_auth.ensureAuth, followCotroller.GetFollowedingUser);
api.get('/getMyFollow/:followed?', md_auth.ensureAuth, followCotroller.getMyFollows);




module.exports = api;