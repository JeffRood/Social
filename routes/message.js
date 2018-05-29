'use strict'

var express = require('express');
var messageCotroller = require('../controllers/message');
var md_auth = require('../middleware/autentificacion');
var api = express.Router();


api.get('/probando-msg', md_auth.ensureAuth, messageCotroller.probando);
api.post('/message', md_auth.ensureAuth, messageCotroller.saveMessage);
api.get('/my-message/:page?', md_auth.ensureAuth, messageCotroller.getReceiverMessage);
api.get('/messages/:page?', md_auth.ensureAuth, messageCotroller.getEmitMessage);
api.get('/unviewed-msg', md_auth.ensureAuth, messageCotroller.getUnviewedMessage);
api.get('/setviewed-msg', md_auth.ensureAuth, messageCotroller.setViewedMessage);




module.exports = api;