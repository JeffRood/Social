'use strict'

var path = require('path');
var mongoosePaginate = require('mongoose-pagination');
var fs = require('fs');
var User = require('../models/user');
var Follow = require('../models/follow');
// para seguir
function SaveFollow(req, res) {
    var params = req.body;
    var follow = new Follow();
    follow.user = req.user.sub;
    follow.followed = params.followed;
    follow.save((err, followStored) => {
        if (err) return res.status(500).send({ message: 'Error al guardar el seguimiento' });
        if (!followStored) return res.status(404).send({ message: 'El seguimiento no se ha guardado' });
        return res.status(200).send({ follow: followStored });


    });
}
// Dejar de seguir
function DeleteFollow(req, res) {
    var userId = req.user.sub;
    var followId = req.params.id;

    Follow.find({ 'user': userId, 'followed': followId }).remove(err => {
        if (err) return res.status(500).send({ message: 'Error al Dejar de seguir' });
        return res.status(200).send({ message: 'Haz dejado de seguirlo' });
    });
}
// Listar usuario que sigo  
function GetFollowingUser(req, res) {
    var user = req.user.sub;
    var followId = req.params.id;
    if (req.params.id && req.params.page) {
        user = req.params.id;
    }
    var page = 1;
    if (req.params.page) {
        page = req.params.page
    } else {
        page = req.params.id;
    }
    var itemPerPage = 2;
    Follow.find({ user: user }).populate({ path: 'followed' }).paginate(page, itemPerPage, (err, follow, total) => {
        if (err) return res.status(500).send({ message: 'Error en el servidor' });
        if (!follow) return res.status(404).send({ message: 'Udted no sigue a nadie papa' });
        return res.status(200).send({
            total: total,
            pages: Math.ceil(total / itemPerPage),
            follow
        });
    })

}
// Listar usuario que me siguen  
function GetFollowedingUser(req, res) {
    var user = req.user.sub;

    if (req.params.id && req.params.page) {
        user = req.params.id;
    }
    var page = 1;
    if (req.params.page) {
        page = req.params.page
    } else {
        page = req.params.id;
    }
    var itemPerPage = 2;
    Follow.find({ followed: user }).populate('user followed').paginate(page, itemPerPage, (err, follow, total) => {
        if (err) return res.status(500).send({ message: 'Error en el servidor' });
        if (!follow) return res.status(404).send({ message: 'No te sigue ningun usuario' });
        return res.status(200).send({
            total: total,
            pages: Math.ceil(total / itemPerPage),
            follow
        });
    })

}
// Devolver usuario que sigo
function getMyFollows(req, res) {
    var user = req.user.sub;

    var find = Follow.find({ user: user });
    if (req.params.followed) {
        var find = Follow.find({ followed: user });
    }
    find.populate('user followed').exec((err, follow) => {
        if (err) return res.status(500).send({ message: 'Error en el servidor' });
        if (!follow) return res.status(404).send({ message: 'No sigue ningun usuario' });
        return res.status(200).send({ follow });
    })

}




module.exports = {
    SaveFollow,
    DeleteFollow,
    GetFollowingUser,
    GetFollowedingUser,
    getMyFollows
}