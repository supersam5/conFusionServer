var mongoose = require('mongoose');
var schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var User  = new schema({
   
    admin: {
        type: Boolean,
        default: false
    },
    firstname:{
        type: String,
        default: " "
    },
    lastname:{
        type: String,
        default: " "
    }

}, {
    timestamps: true
});
User.plugin(passportLocalMongoose);
const Users = mongoose.model('User', User);

module.exports = Users;