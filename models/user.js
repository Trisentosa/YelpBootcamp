const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');
const { model } = require('./review');

const userSchema = new Schema({
    email:{
        type:String,
        required:true,
        unique:true
    }
})

//add on to our schema username and password to our schema
//Also added salt ,hashed password
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);
