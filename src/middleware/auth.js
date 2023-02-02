const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const BookModel = require("../model/BookModel");

//<-------------------------------------# AUTHENTICATION #------------------------------------->//

exports.authentication = async function (req, res, next) {
  try {
    // check token : -
    let token = req.headers["x-api-key"];
    if (!token)
      return res
        .status(401)
        .send({ status: false, msg: "Token Must be Filled" });

    // // verify token :
    jwt.verify(token, "Book-management-secure-key", (err, decodedToken) => {
      if (err)
        return res
          .status(400)
          .send({ status: false, message: "Invalid token." });

      req.decodedToken = decodedToken;
      next();
    });
  } catch (err) {
    res.status(500).send({ status: false, msg: err.message });
  }
};

//<-------------------------------------# AUTHORISATION #------------------------------------->//

exports.authorisation = async function (req, res, next) {
  try {
    const decodedToken = req.decodedToken;
    const bookId = req.params.bookId;

    if (!mongoose.isValidObjectId(bookId))
      return res
        .status(400)
        .send({ status: false, message: "Invalid bookId." });

    const book = await BookModel.findOne({ _id: bookId, isDeleted: false });
    
    if (!book)
      return res
        .status(404)
        .send({ status: false, message: "Book not found." });

    if (book.userId != decodedToken.id)
      return res
        .status(403)
        .send({ status: false, message: "Not authorised." });

    next();
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};