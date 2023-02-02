const { default: mongoose, isValidObjectId } = require("mongoose");
const ReviewModel = require("../model/ReviewModel");
const BookModel = require("../model/BookModel");
const { isValidName } = require("../validator/validation");

//<-------------------------------------# CREATE REVIEW #------------------------------------->//

exports.createReview = async function (req, res) {
    try {
        const data = req.body;
        const bookId = req.params.bookId;
        Object.keys(data).forEach((x) => (data[x] = data[x].toString().trim()));

        const { reviewedBy, rating } = data;

        if (!reviewedBy) data.reviewedBy = "Guest";

        if (!rating)
            return res
                .status(400)
                .send({ status: false, message: "rating must present" });

        if (isNaN(rating) || rating > 5 || rating < 1) {
            return res
                .status(400)
                .send({
                    status: false,
                    message: "Please provide a number between 1 & 5 in rating.",
                });
        }

        if (!isValidObjectId(bookId))
            return res
                .status(400)
                .send({ status: false, message: "Please enter a valid bookId." });

        const book = await BookModel.findOneAndUpdate(
            { _id: bookId, isDeleted: false },
            { $inc: { reviews: 1 } },
            { new: true }
        );

        if (!book)
            return res
                .status(404)
                .send({ staus: false, message: "Book not found." });

        data.bookId = bookId;
        data.reviewedAt = Date.now();
        data.rating = Math.floor(data.rating * 10) / 10;
        const reviewedData = await ReviewModel.create(data);

        return res
            .status(201)
            .send({
                status: true,
                data: {
                    book,
                    reviewedData
                },
            });
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
};

//<-------------------------------------# UPDATE REVIEW #------------------------------------->//

exports.updateReview = async function (req, res) {
    try {
        const reviewId = req.params.reviewId;
        const bookId = req.params.bookId;

        if (!mongoose.isValidObjectId(reviewId))
            return res
                .status(400)
                .send({ status: false, message: "Invalid reviewId." });

        if (!mongoose.isValidObjectId(bookId))
            return res
                .status(400)
                .send({ status: false, message: "Invalid bookId." });

        const data = req.body;
        Object.keys(data).forEach((x) => (data[x] = data[x].toString().trim()));

        let { review, rating, reviewedBy } = data;

        if (!review && !rating && !reviewedBy)
            return res
                .status(400)
                .send({
                    status: false,
                    message: "Please put any field that you want to update.",
                });

        if (rating) {
            if((isNaN(rating) || rating > 5 || rating < 1))
                return res
                    .status(400)
                    .send({
                        status: false,
                        message: "Please provide a number between 1 & 5 in rating.",
                    });
                    rating = Math.floor(rating * 10) / 10;
        }
        if (reviewedBy && !isValidName(reviewedBy))
            return res
                .status(400)
                .send({
                    status: false,
                    message: "Please provide valid reviewer's name.",
                });

        const book = await BookModel.findOne({ _id: bookId, isDeleted: false });

        if (!book)
            return res
                .status(404)
                .send({ staus: false, message: "Book not found." });

        const reviewedData = await ReviewModel.findOneAndUpdate(
            {
                _id: reviewId,
                bookId,
                isDeleted: false,
            },
            {
                review,
                reviewedBy,
                rating,
            },
            {
                new: true,
            }
        );

        if (!reviewedData)
            return res
                .status(404)
                .send({ status: false, message: "No such review found." });

        return res
            .status(200)
            .send({
                status: true,
                data: {
                    book,
                    reviewedData
                },
            });
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
   
};

//<-------------------------------------# DELETE REVIEW #------------------------------------->//

exports.deleteReview = async function (req, res) {
    try {
        const reviewId = req.params.reviewId;
        const bookId = req.params.bookId;

        if (!mongoose.isValidObjectId(reviewId))
            return res
                .status(400)
                .send({ status: false, message: "Invalid reviewId." });

        if (!mongoose.isValidObjectId(bookId))
            return res
                .status(400)
                .send({ status: false, message: "Invalid bookId." });

        let review = await ReviewModel.findOneAndUpdate(
            { _id: reviewId, bookId, isDeleted: false },
            { isDeleted: true },
            { new: true }
        );
        if (!review)
            return res
                .status(404)
                .send({ status: false, message: "review not exist" });

        const book = await BookModel.findOneAndUpdate(
            { _id: bookId, isDeleted: false },
            { $inc: { reviews: -1 } }
        );

        if (!book)
            return res
                .status(404)
                .send({ staus: false, message: "Book not found." });

        res.status(200).send({ status: true, message: "Review is deleted succesfully." });
    } catch (err) {
        res.status(500).send({ status: false, msg: err.message });
    }
};

