const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 200; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random()*30+10);
        const camp = new Campground({
            author: '611f2a351f8f9b1f52120a84',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            geometry:{
                type: "Point",
                coordinates: [cities[random1000].longitude, cities[random1000].latitude]
            },
            images:[ 
                {
                url:
                 'https://res.cloudinary.com/doafgkczh/image/upload/v1629581639/YelpCamp/tijjhllkwn3knvrirkbk.jpg',
                filename: 'YelpCamp/tijjhllkwn3knvrirkbk' 
                },
                {
                url:
                 'https://res.cloudinary.com/doafgkczh/image/upload/v1629581639/YelpCamp/tt4mx1xcmlugmqyuimaa.jpg',
                filename: 'YelpCamp/tt4mx1xcmlugmqyuimaa' 
                } 
            ],
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Asperiores, placeat commodi rerum non voluptas illum minus optio maxime dolores sequi saepe et aspernatur eum vitae. Molestias cupiditate nam corrupti excepturi.',
            price: price
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})