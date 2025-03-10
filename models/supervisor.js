const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');
const supervisorschema = new Schema({
    aadharno: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        required: true,
        enum: ['male', 'female', 'other'] // Restricts gender to these values
    },
    email: {
        type: String,
        required: true,
    },
    supervisorid: {
        type: String,
        required: true,
        trim: true
    }
}); 
supervisorschema.plugin(passportLocalMongoose);
module.exports = mongoose.model('supervisor', supervisorschema);
