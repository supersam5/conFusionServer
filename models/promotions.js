const mongoose = require('mongoose');
const Schema =mongoose.Schema;
require('mongoose-currency').loadType(mongoose);
const currency = mongoose.Types.Currency;


const promotionSchema = new Schema({
    name : {
        type: String,
        minlength: 2,
        required: true,
        unique: true
    },
    image : {
        type: String,
    },
    label : {
        type: String,
        default: ' '
    },
    price: {
        type: currency,
        required: true,
        min: 0
    },
    description: {
        type: String,
        required: true,
    },
    featured: {
        type: Boolean,
        required: true,
        default: false
    }
}, {
    timestamps: true,

})

var Promotions = mongoose.model("Promotion", promotionSchema);
module.exports = Promotions;