const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({ //Schema is mongoose.Schema because it was declared above
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [ 
        {
        type: Schema.Types.ObjectId,
        ref: 'Review' //the model
        }
]
})

CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if(doc){
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema);