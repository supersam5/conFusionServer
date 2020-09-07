const mongoose = require("mongoose")
const Schema = mongoose.Schema;


let favouriteSchema = new Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required: true
    },
    dishes : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Dish'
    }]
}, {
    timestamps: true
})


const favourites = mongoose.model('Favourite', favouriteSchema)

module.exports = favourites;