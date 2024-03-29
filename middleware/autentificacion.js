'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'clave_secreta_red_plus_talk';

exports.ensureAuth = function(req, res, next) {
    if (!req.headers.authorization) {
        return res.status(403).send({
            message: "La peticion no tiene la cabeza de autorizacion"
        });

    }
    var token = req.headers.authorization.replace(/['"]+ /g, '');

    try {
        var payload = jwt.decode(token, secret);
        if (payload.exp <= moment().unix()) {
            return res.status(401).send({
                message: 'El Token a Expirado'
            });
        }
    } catch (ex) {
        return res.status(404).send({
            message: 'El Token no es valido'
        });
    }
    req.user = payload;
    next();
}