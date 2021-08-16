const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({ //Schema is mongoose.Schema because it was declared above
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    reviews: [ {
        type: Schema.Types.ObjectId,
        ref: 'Review' //the model
    }]
})

module.exports = mongoose.model('Campground', CampgroundSchema);