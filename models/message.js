'use strict'

var moongose = require('mongoose');
var Schema = moongose.Schema;

var MessageSchema = Schema({
    text: String,
    create_at: String,
    viewed: String,
    emitter: { type: Schema.ObjectId, ref: 'User' },
    receiver: { type: Schema.ObjectId, ref: 'User' }
})

module.exports = moongose.model('Message', MessageSchema);