const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
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