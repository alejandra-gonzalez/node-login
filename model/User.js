const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportMongoose = require('passport-local-mongoose');

let User = new Schema({
    username: {
        type: String
    },
    password: {
        type: String
    }
});

User.plugin(passportMongoose);

module.exports = mongoose.model('User', User);