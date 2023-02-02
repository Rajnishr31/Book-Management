const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    bookId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "Book"
    },
    reviewedBy: {
        type: String,
        required: true,
        default: 'Guest',
        value: String
    }, //reviwer's name
    reviewedAt: {
        type: Date,
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    review: String,
    isDeleted: {
        type: Boolean,
        default: false
    },
},
{timestamps: true}
);

module.exports = mongoose.model("Review", ReviewSchema);