const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelper');
const Campground = require('../models/campground');
const Review = require('../models/review');

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
    await Review.deleteMany({});
    for (let i=0; i<10; i++) {
        const random = Math.floor(Math.random() * cities.length);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            location: `${cities[random].city}, ${cities[random].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
            price,
            author: "6098570d78926eb3c1387d83",
            images: [
                {
                    url: 'https://res.cloudinary.com/dsl1muf0t/image/upload/v1620705727/YelpCamp/sd7puau5p1egfyevldzp.jpg',
                    filename: 'YelpCamp/sd7puau5p1egfyevldzp'
                },
                {
                    url: 'https://res.cloudinary.com/dsl1muf0t/image/upload/v1620705723/YelpCamp/xk7pwxlxjszctqbcggg2.jpg',
                    filename: 'YelpCamp/xk7pwxlxjszctqbcggg2'
                }
            ]
        });
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
    console.log('Database closed');
});