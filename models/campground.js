const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

// image transform via url
// https://res.cloudinary.com/douqbebwk/image/upload/w_300/v1600113904/YelpCamp/gxgle1ovzd2f3dgcpass.png

const ImageSchema = new Schema({
    url: String,
    filename: String
});

// virtual getter, e.g., campground.images[0].thumbnail
ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_150');
});

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
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
            ref: 'Review'
        }
    ]
});

// middleware: delete associated reviews after deleting a campground
CampgroundSchema.post('findOneAndDelete', async (camp) => {
    if (camp) {
        await Review.deleteMany({
            _id: { $in: camp.reviews }
        });
    }
});

module.exports = mongoose.model('Campground', CampgroundSchema);