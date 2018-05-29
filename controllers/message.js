'use strict'

var path = require('path');
var mongoosePaginate = require('mongoose-pagination');
var fs = require('fs');
var User = require('../models/user');
var Follow = require('../models/follow');
var moment = require('moment');
var Message = require('../models/message');


function probando(req, res) {
    res.status(200).send({
        message: 'Hola desde el controlador de publicaciones'
    })

}
// Enviar un mensaje
function saveMessage(req, res) {
    var params = req.body;

    if (!params.text || !params.receiver) {
        res.status(200).send({
            message: 'Envia los datos necesario'
        });
    }
    var message = new Message();
    message.emitter = req.user.sub;
    message.receiver = params.receiver;
    message.text = params.text;
    message.create_at = moment().unix();
    message.viewed = 'false';
    message.save((err, message) => {
        if (err) return res.status(500).send({ message: 'Error en la peticion' });
        if (!message) return res.status(404).send({ message: 'Error al enviar el mensaje' });
        return res.status(200).send({ Message: message })

    })
}
// TODO
// Listado de mensaje en mi cuenta
function getReceiverMessage(req, res) {
    var userId = req.user.sub;
    var page = 1;
    if (req.params.page) {
        page = req.params.page;
    }
    var itemPerPage = 4;
    Message.find({ receiver: userId }).populate('emitter', 'name nick surname image')
        .paginate(page, itemPerPage, (err, message, total) => {
            if (err) return res.status(500).send({ message: 'Error en la peticion' });
            if (!message) return res.status(404).send({ message: 'No hay mensaje' });
            return res.status(200).send({
                total: total,
                page: Math.ceil(total / itemPerPage),
                message
            })

        });

}

function getEmitMessage(req, res) {
    var userId = req.user.sub;
    var page = 1;
    if (req.params.page) {
        page = req.params.page;
    }
    var itemPerPage = 4;
    Message.find({ emitter: userId }).populate('emitter receiver', 'name nick surname image')
        .paginate(page, itemPerPage, (err, message, total) => {
            if (err) return res.status(500).send({ message: 'Error en la peticion' });
            if (!message) return res.status(404).send({ message: 'No hay mensaje' });
            return res.status(200).send({
                total: total,
                page: Math.ceil(total / itemPerPage),
                message
            })

        });
}

function getUnviewedMessage(req, res) {
    var useId = req.user.sub;
    Message.count({ receiver: useId, viewed: 'false' }).exec().then(count => {
        return res.status(200).send({
            'inviewed': count
        })
    })

}

function setViewedMessage(req, res) {
    var userId = req.user.sub;
    Message.update({ receiver: userId, viewed: 'false' }, { viewed: 'true' }, { 'multi': true }, (err, messageUpdate) => {
        if (err) return res.status(500).send({ message: 'Error en la peticion' });
        return res.status(200).send({
            message: messageUpdate
        })
    })

}
module.exports = {
    probando,
    saveMessage,
    getReceiverMessage,
    getEmitMessage,
    getUnviewedMessage,
    setViewedMessage
}