const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String,
        required:true,
        unique:true
    }
});

UserSchema.plugin(passportLocalMongoose); //this will add user and pass to the schema, make sure they are unique, and other methods

module.exports = mongoose.model('User', UserSchema);