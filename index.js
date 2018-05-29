'use strict'

var mongoose = require('mongoose');
var app = require('./app')
var port = 3800;

//Coneccion a la base de datos
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/PlusTalk')
    .then(() => {
        console.log("Coneccion correctamente");

        //Crear Servidor
        app.listen(port, () => {
            console.log("Servidor Corriendo en localhost:3800");

        })

    }).catch(err => console.log(err));