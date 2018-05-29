'use strict'

var path = require('path');
var fs = require('fs');
var mongoosePaginate = require('mongoose-pagination');
var moment = require('moment');
var Publication = require('../models/publication');
var Follow = require('../models/follow');
var User = require('../models/user');

function probando(req, res) {
    res.status(200).send({
        message: 'Hola desde el controlador de publicaciones'
    })

}
// guardar publicaciones

function savePublication(req, res) {
    var params = req.body;
    if (!params.text) return res.status(200).send({ message: 'Debes enviar un texto' })
    var publications = new Publication();
    publications.text = params.text;
    publications.file = 'null';
    publications.user = req.user.sub;
    publications.create_at = moment().unix();

    publications.save((err, ps) => {
        if (err) return res.status(500).send({ message: 'Error al guardar la publicacion' });
        if (!ps) return res.status(404).send({ message: 'La publicacion no ha sido guardada' });
        return res.status(200).send({ Publication: ps })

    })


}

// obtener publicaciones
function getPublications(req, res) {
    var page = 1;
    if (req.params.page) {
        page = req.params.page
    }
    var itemPerPage = 4;
    Follow.find({ user: req.user.sub }).populate('followed')
        .exec().then(follow => {
            var follow_clean = [];
            follow.forEach(follow => {
                follow_clean.push(follow.followed);
            });
            Publication.find({ user: { '$in': follow_clean } })
                .sort('-created_at').populate('user')
                .paginate(page, itemPerPage,
                    (err, publications, total) => {
                        if (err) return res.status(500).send({ message: 'Error al devolver las publicaciones' });
                        if (!publications) return res.status(404).send({ message: 'No hay publicaciones' });
                        return res.status(200).send({
                            total_items: total,
                            pages: Math.ceil(total),
                            page: page,
                            publications
                        })
                    });
        });
}


function getPublication(req, res) {
    var publicatioid = req.params.id;
    Publication.findById(publicatioid, (err, Publication) => {

        if (err) return res.status(500).send({ message: 'Error al devolver la publicacione' });
        if (!Publication) return res.status(404).send({ message: 'No existe la publicacione' });
        return res.status(200).send({ Publication })

    })
}

function deletePublication(req, res) {
    var publicatioid = req.params.id;
    Publication.find({ user: req.user.sub, '_id': publicatioid }).remove(err => {

        if (err) return res.status(500).send({ message: 'Error al Eliminar la publicacione' });
        // if (!Publication) return res.status(404).send({ message: 'No se ha Borrado la Publicacion' });
        return res.status(200).send({ message: 'Publicacion Eliminada' })

    })
}


// Subir imagen para una publicacion

function uploadImage(req, res) {
    var publicationid = req.params.id;
    if (req.files) {
        var file_path = req.files.image.path;
        var file_split = file_path.split('\\'); // Eliminar los caracteres especiales de la ruta de las imagenes

        var file_name = file_split[2]; // cortar la parte de la ruta donde se encuentra la imagen
        var ext_split = file_name.split('\.'); // obtener el nombre de la imagen y su extension
        var file_ext = ext_split[1]; // Obtener la extension de la imagen


        // Verificar extensiones permitidas
        if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif') {

            Publication.findOne({ 'user': req.user.sub, '_id': publicationid }).exec().then(publication => {
                if (publication) {
                    //actualizar el documento del usuario logueado
                    Publication.findByIdAndUpdate(publicationid, { file: file_name }, { new: true }, (err, publicationUpdated) => {
                        if (err) return res.status(500).send({ message: 'Error en la peticion' });

                        if (!publicationUpdated) return res.status(404).send({ message: 'no se ha podido actualizar el usuario' });

                        return res.status(200).send({ publication: publicationUpdated });
                    });

                } else {
                    return removeFilesOfUploads(res, file_path, 'No tienes permiso para actualizar');
                }
            });

        } else {
            return removeFilesOfUploads(res, file_path, 'Extension no Valida');
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

// Obtener imagen de una publicacion
function getImageFile(req, res) {
    var image_file = req.params.imageFile;

    var path_file = './uploads/publication/' + image_file;

    fs.exists(path_file, (exist) => {
        if (exist) {
            res.sendFile(path.resolve(path_file));
        } else {
            res.status(200).send({ message: 'No existe la imagen...' });
        }
    })
}



module.exports = {
    probando,
    savePublication,
    getPublications,
    getPublication,
    deletePublication,
    uploadImage,
    getImageFile
}