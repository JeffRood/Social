'use strict'
// Librerias, dependencias, modulos
var bcrypt = require('bcrypt-nodejs');
var Follow = require('../models/follow');
var User = require('../models/user');
var jwt = require('../services/jwt');
var mongooaawPaginate = require('mongoose-pagination');
var fs = require('fs');
var path = require('path');
var Publication = require('../models/publication');

// Metodos de prueba
function Home(req, res) {
    res.status(200).send({
        message: 'Klk soy el home'
    });
}

function pruebas(req, res) {
    res.status(200).send({
        message: 'klk eto e una prueba '
    });
}

// Funcion POST para registrar un usuario 
function saveUser(req, res) {
    var params = req.body;
    var user = new User();

    // ASIGNACION de los valores del body a las propiedades del modelo para hacer el registro
    if (params.name &&
        params.surname &&
        params.nick &&
        params.email &&
        params.password) {
        user.name = params.name;
        user.surname = params.surname;
        user.nick = params.nick;
        user.email = params.email;
        user.role = 'ROLE_USER';
        user.image = null;

        // CONTROLAR usuarios duplicados
        User.find({
            $or: [
                { email: user.email.toLowerCase() },
                { nick: user.nick.toLowerCase() }
            ]
        }).exec((err, users) => {
            if (err) return res.status(500).send({ message: 'Error en la peticion de usuarios' });

            if (users && users.length >= 1) {
                return res.status(200).send({ message: 'El usuario que intenta registrar ya existe' });
            } else {
                // CIFRAR LA CONTRASEÑA Y GUARDA LOS DATOS
                bcrypt.hash(params.password, null, null, (err, hash) => {
                    user.password = hash;

                    user.save((err, userStored) => {
                        if (err) return res.status(500).send({ message: 'Error al guardar el usuario' });

                        if (userStored) {
                            res.status(200).send({ user: userStored });
                        } else {
                            res.status(404).send({ message: 'no se ha registrado el usario' });
                        }
                    });
                });
            }
        });
    } else {
        res.status(200).send({
            message: 'Debes enviar todos los campos necesarios'
        })
    }
}

// Login
function LoginUser(req, res) {
    var params = req.body;

    var email = params.email;
    var password = params.password;
    //Comprobar que exista un usuario con el email y la contraseña mandada
    User.findOne({ email: email }, (err, user) => {
        if (err) return res.status(500).send({ message: 'Error en la peticion' });

        if (user) {
            // Comprobar el hash de bcrypt con la contraseña enviada
            bcrypt.compare(password, user.password, (err, check) => {
                if (check) {
                    // Sistema de TOKENS
                    if (params.gettoken) {
                        //devolver y token
                        return res.status(200).send({
                            token: jwt.createtoken(user)
                        })
                    } else {
                        //devolver datos de usuario
                        user.password = undefined;
                        return res.status(200).send({ user });
                    }

                } else {
                    return res.status(404).send({ message: 'El usuario no se ha podido identificar' });
                }
            })
        } else {
            return res.status(404).send({ message: 'No existe usuario registrado' });
        }
    })
}

// Conseguir datos de 1 usuario

function getUser(req, res) {
    var userId = req.params.id;

    User.findById(userId, (err, user) => {
        if (err) return res.status(500).send({ message: 'Error en la peticion' })

        if (!user) return res.status(404).send({ message: 'El usuario no existe' })

        followThisUser(req.user.sub, userId).then((value) => {
            console.log(value);
            user.password = undefined;
            return res.status(200).send({
                user,
                following: value.following,
                followed: value.followed
            })

        })



    })




}

async function followThisUser(identity_user_id, user) {

    var following = await Follow.findOne({ 'user': identity_user_id, 'followed': user }).exec().then(follow => {

        return follow;

    });

    var followed = await Follow.findOne({ 'user': user, 'followed': identity_user_id }).exec().then(follow => {

        return follow;
    });
    return await {

        following: following,
        followed: followed,
        message: 'Recuerde que si tiene un error es suyo'
    }
}
// Cuenta las cantidad de follow y publicaciones de un useuario
function getCounter(req, res) {
    var userId = req.user.sub;
    if (req.params.id) {
        userId = req.params.id;
    }
    getCountFollow(userId).then(value => {
        return res.status(200).send(value);
    })

}
async function getCountFollow(user_id) {
    var following = await Follow.count({ 'user': user_id }).exec().then(count => {
        return count;
    });

    var followed = await Follow.count({ 'followed': user_id }).exec().then(count => {
        return count;
    });

    var publication = await Publication.count({ 'user': user_id }).exec().then(count => {
        return count
    })
    return {

        following: following,
        followed: followed,
        publication: publication
    }
}

// Devolver lista de usuarios paginados
function getUsers(req, res) {
    var identity_user_id = req.user.sub;

    var page = 1;
    if (req.params.page) {
        page = req.params.page;
    }
    var itemsPerPage = 10;

    // Paginar la lista y mostrar el total de registros
    User.find().sort('_id').paginate(page, itemsPerPage, (err, users, total) => {
        if (err) return res.status(500).send({ message: 'Error en la peticion' });
        if (!users) return res.status(404).send({ message: 'No hay usuarios disponibles' });
        followUserIds(identity_user_id).then(value => {
            return res.status(200).send({
                users,
                users_following: value.following,
                users_follow_me: value.followed,
                total,
                pages: Math.ceil(total / itemsPerPage)
            })
        })

    });
}

// Listado de usuario que nos siguen

async function followUserIds(user_id) {
    var following = await Follow.find({ 'user': user_id }).select({ '_id': 0, '_v': 0, 'user': 0 })
        .exec().then(follow => {
            return follow;
        })
    var followed = await Follow.find({ 'followed': user_id }).select({ '_id': 0, '_v': 0, 'followed': 0 })
        .exec().then(follow => {
            return follow;
        })
        // Procesar following id
    var following_clean = [];
    following.forEach((follow) => {
        following_clean.push(follow.followed)
    });
    // Procesar followed id
    var followed_clean = [];
    followed.forEach((follow) => {
        followed_clean.push(follow.user)
    });
    return {
        following: following_clean,
        followed: followed_clean

    }
}




// Actualizar un usuario
function UpdateUser(req, res) {
    var userId = req.params.id;
    var update = req.body;

    //borrar propiedad password
    delete update.password;

    if (userId != req.user.sub) {
        return res.status(500).send({ message: 'no tienes permiso para actualizar los datos del usuario' });

    }
    User.find({
        $or: [
            { email: update.email.toLowerCase() },
            { nick: update.nick.toLowerCase() }
        ]
    }).exec().then((user) => {
        var user_isset = false;
        user.forEach(user => {
            if (user && user._id != userId) user_isset = true;
        });
        if (user_isset) return res.status(404).send({ message: 'Los datos ya estan en uso' });
        User.findByIdAndUpdate(userId, update, { new: true }, (err, userUpdate) => {
            if (err) return res.status(500).send({ message: 'Error en la peticion' });

            if (!userUpdate) return res.status(404).send({ message: 'no se ha podido actualizar el usuario' });

            return res.status(200).send({ user: userUpdate });
        });
    });

}

// Subir archivos de imagen/avatar de usuario

function uploadImage(req, res) {
    var userId = req.params.id;
    if (req.files) {
        var file_path = req.files.image.path;
        var file_split = file_path.split('\\'); // Eliminar los caracteres especiales de la ruta de las imagenes

        var file_name = file_split[2]; // cortar la parte de la ruta donde se encuentra la imagen 
        var ext_split = file_name.split('\.'); // obtener el nombre de la imagen y su extension
        var file_ext = ext_split[1]; // Obtener la extension de la imagen

        // Validar que solo el usuario logueado puede modificar su imagen
        if (userId != req.user.sub) {
            return removeFilesOfUploads(res, file_path, 'No tienes permiso para actualizar los datos del usuario');
        }

        // Verificar extensiones permitidas
        if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif') {
            //actualizar el documento del usuario logueado
            User.findByIdAndUpdate(userId, { image: file_name }, { new: true }, (err, userUpdated) => {
                if (err) return res.status(500).send({ message: 'Error en la peticion' });

                if (!userUpdated) return res.status(404).send({ message: 'no se ha podido actualizar el usuario' });

                return res.status(200).send({ user: userUpdated });
            });
        } else {
            return removeFilesOfUploads(res, file_path, 'Extensión no valida');
        }
    } else {
        return res.status(200).send({ message: 'No se han subido imagenes' });
    }
}

// Remover el fichero de imagen de la carpeta
function removeFilesOfUploads(res, file_path, message) {
    fs.unlink(file_path, (err) => {
        return res.status(200).send({ message: message });
    })
}

// Obtener imagen del usuario
function getImageFile(req, res) {
    var image_file = req.params.imageFile;

    var path_file = './uploads/users/' + image_file;

    fs.exists(path_file, (exist) => {
        if (exist) {
            res.sendFile(path.resolve(path_file));
        } else {
            res.status(200).send({ message: 'No existe la imagen...' });
        }
    })
}






// Exportacion de las funciones

module.exports = {
    Home,
    pruebas,
    saveUser,
    LoginUser,
    getUser,
    getUsers,
    getCounter,
    UpdateUser,
    uploadImage,
    getImageFile
}