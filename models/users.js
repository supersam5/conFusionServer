var mongoose = require('mongoose');
var schema = mongoose.Schema;

var User  = new schema({
    username : {
        type: String,
        required: true,
        unique: true
    },
    password : {
        type: String,
        required: true
    },
    admin: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true
});
const Users = mongoose.model('User', User);

module.exports = Users;