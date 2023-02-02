const { default: mongoose, isValidObjectId } = require("mongoose");
const BookModel = require("../model/BookModel");
const ReviewModel = require("../model/ReviewModel");
const validation = require("../validator/validation");
//const { uploadFile} = require('../middleware/aws');
let { isValid, isVAlidISBN, isVAlidDate } = validation;

//>-------------------------------------- CREATE BOOK ----------------------------------------<//

exports.createBook = async (req, res) => {
    try {
        let data = req.body;
        let fields = Object.keys(data);
        if (fields.length == 0) return res.status(400).send({ status: false, message: "Please provide data for create a book." });
        fields.forEach(
            (x) => (data[x] = data[x].toString().trim())
        );

        let {
            title,
            excerpt,
            userId,
            ISBN,
            category,
            subcategory,
            releasedAt,
            isDeleted,
            reviews,
            bookCover,
            ...rest
        } = data; //Destructuring

        if (Object.keys(rest).length != 0) {
            //Checking extra attributes are added or not
            return res.status(400).send({
                status: false,
                message: "Not allowed to add extra attributes",
            });
        }

        if (!title) {
            return res
                .status(400)
                .send({ status: false, message: "title is required." });
        }
        if (!isValid(title)) {
            return res
                .status(400)
                .send({ status: false, message: "Please provide Valid Title." });
        }
        title = title.toLowerCase();
        data.title = data.title.toLowerCase();
        if (!excerpt) {
            return res
                .status(400)
                .send({ status: false, message: "experpt is required." });
        }
        if (!isValid(excerpt)) {
            return res
                .status(400)
                .send({ status: false, message: "Please provide Valid excerpt." });
        }
        if (!userId) {
            return res
                .status(400)
                .send({ status: false, message: "userId is required." });
        }
        if (!isValidObjectId(userId))
            return res
                .status(400)
                .send({ status: false, message: "Invalid userId." });
        if (!ISBN) {
            return res
                .status(400)
                .send({ status: false, message: "ISBN is required." });
        }
        if (!isVAlidISBN(ISBN)) {
            return res
                .status(400)
                .send({ status: false, message: "Please provide Valid ISBN." });
        }
        if (!category) {
            return res
                .status(400)
                .send({ status: false, message: "category is required." });
        }
        if (!isValid(category)) {
            return res
                .status(400)
                .send({ status: false, message: "Please provide Valid category." });
        }
        if (!subcategory) {
            return res
                .status(400)
                .send({ status: false, message: "subcategory is required." });
        }
        if (!isValid(subcategory)) {
            return res
                .status(400)
                .send({ status: false, message: "Please provide Valid subcategory." });
        }
        if (!releasedAt) {
            return res
                .status(400)
                .send({ status: false, message: "releasedAt is required." });
        }
        if (!isVAlidDate(releasedAt)) {
            return res
                .status(400)
                .send({ status: false, message: "Date must be in YYYY-MM-DD format." });
        }

        /*----------------------------------- Checking Unique -----------------------------*/

        const check = await BookModel.findOne({ $or: [{ title }, { ISBN }] });

        if (check) {
            if (check.title == title) {
                return res
                    .status(400)
                    .send({ status: false, message: "This title is already exist." });
            }
            if (check.ISBN == ISBN) {
                return res
                    .status(400)
                    .send({ status: false, message: "This ISBN is already exist." });
            }
        }

        /*---------------------------------------------------------------------------------------*/

        // let files= req.files
        // let uploadedFileURL;
        // if(files && files.length>0){
        //     uploadedFileURL= await uploadFile( files[0] )
        // }
        // else{
        //     return res.status(400).send({status: false, message: "No file found" });
        // }

        /*---------------------------------------------------------------------------------------*/
        let createBook = await BookModel.create({...data});

        return res.status(201).send({
            status: true,
            message: `This ${title} Book is created sucessfully.`,
            data: createBook,
        });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

//<-------------------------------------# GET BOOKS #------------------------------------->//

exports.getBooks = async function (req, res) {
    try {
        const queries = req.query;
        const books = await BookModel.find({ ...queries, isDeleted: false }).select(
            {
                title: 1,
                excerpt: 1,
                userId: 1,
                category: 1,
                subcategory: 1,
                releasedAt: 1,
                reviews: 1,
            }
        );
        if (!books.length)
            return res
                .status(404)
                .send({ status: false, message: "Book not found." });

        books.sort((a, b) => a.title.localeCompare(b.title));
        res.status(200).send({ status: true, data: books });
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
};

//<-------------------------------------# GET BOOK #------------------------------------->//

exports.getBook = async function (req, res) {
    try {
        const id = req.params.bookId;
        if (!mongoose.isValidObjectId(id))
            return res
                .status(400)
                .send({ status: false, message: "Please enter valid book id." });
        let book = await BookModel.findOne({ _id: id, isDeleted: false });
        if (!book)
            return res
                .status(404)
                .send({ status: false, message: "Book not found." });
        const reviews = await ReviewModel.find({ bookId: id });
        book._doc.reviewsData = reviews;
        res.status(200).send({ status: true, data: book });
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
};

//<-------------------------------------# UPDATE BOOK #------------------------------------->//

exports.updateBook = async function (req, res) {
    try {
        const bookId = req.params.bookId;
        let data = req.body;
        Object.keys(data).forEach((x) => (data[x] = data[x].toString().trim()));
        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, message: "Body is empty" });
        }
        let { title, excerpt, releasedAt, ISBN, ...rest } = data;
        if (Object.keys(rest).length != 0) {
            //Checking extra attributes are added or not
            return res
                .status(400)
                .send({
                    status: false,
                    message: "Not allowed to add extra attributes",
                });
        }
        if (title) {
            if (!isValid(title)) {
                return res
                    .status(400)
                    .send({ status: false, message: "The title is in inValid Format." });
            }
            title = title.toLowerCase();
            data.title = title.toLowerCase();
        }
        if (excerpt) {
            if (!isValid(excerpt)) {
                return res
                    .status(400)
                    .send({ status: false, message: "The excerpt is in inValid Format." });
            }
        }
        if (releasedAt) {
            if (!isVAlidDate(releasedAt)) {
                return res
                    .status(400)
                    .send({ status: false, message: "Date must be in YYYY-MM-DD format." });
            }
        }
        if (ISBN) {
            if (!isVAlidISBN(ISBN)) {
                return res
                    .status(400)
                    .send({ status: false, message: "Please provide Valid ISBN." });
            }
        }

        if (title == req.book.title)
            return res
                .status(400)
                .send({ status: false, message: "title should be unique" });
        if (releasedAt == req.book.releasedAt)
            return res
                .status(400)
                .send({ status: false, message: "releasedAt should be unique" });
        if (ISBN == req.book.ISBN)
            return res
                .status(400)
                .send({ status: false, message: "ISBN should be unique" });

        const updatedBook = await BookModel.findByIdAndUpdate(
            { _id: bookId },
            data,
            { new: true }
        );
        res
            .status(200)
            .send({
                status: true,
                message: "book updated successfully",
                data: updatedBook,
            });
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
};

//<-------------------------------------# DELETE BOOK #------------------------------------->//

exports.deletedBook = async (req, res) => {
    try {
        let bookId = req.params.bookId;
        await BookModel.findByIdAndUpdate(
            bookId,
            { isDeleted: true },
            { new: true }
        )

        return res.status(200).send({
            status: true,
            msg: "Book has been deleted successfully."
        });
    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message });
    }
};