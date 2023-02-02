const userModel = require("../model/UserModel.js");
const validation = require("../validator/validation");
const moment = require("moment");
const jwt = require("jsonwebtoken");
let { isValidTitle, isValidName, isValidPhone, isValidEmail, isValidPassword } =
  validation;

//<-------------------------------------# CREATE USER #------------------------------------->//

exports.createUser = async function (req, res) {
  try {
    let data = req.body;
    let { title, name, phone, email, password, address } = data;
    if (Object.keys(data).length == 0) {
      return res
        .status(400)
        .send({ status: false, msg: "Please provide key in request body" });
    }
    Object.keys(data).forEach((x) => (data[x] = data[x].toString().trim()));

    if (!title) {
      return res
        .status(400)
        .send({ status: false, msg: "Please provide title" });
    }

    if (!name) {
      return res
        .status(400)
        .send({ status: false, msg: "Please provide name" });
    }
    if (!phone) {
      return res
        .status(400)
        .send({ status: false, msg: "Please provide phone no." });
    }
    if (!email) {
      return res
        .status(400)
        .send({ status: false, msg: "Please provide email" });
    }
    if (!password) {
      return res
        .status(400)
        .send({ status: false, msg: "Please provide password" });
    }
    if (!isValidTitle(title)) {
      return res
        .status(400)
        .send({ status: false, msg: "title should be alphabets only" });
    }

    if (!isValidName(name)) {
      return res
        .status(400)
        .send({ status: false, msg: "name should be alphabets only" });
    }

    if (!isValidPhone(phone))
      return res.status(400).send({
        status: false,
        message: "Please provide a valid indian phone no.",
      });

    if (!isValidEmail(email)) {
      return res
        .status(400)
        .send({ status: false, msg: "Provide a valid email" });
    }

    if (!isValidPassword(password)) {
      return res.status(400).send({
        status: false,
        msg: "Password must contain at least 1 upperCase, 1 lowerCase and 1 special character, minlen = 8, maxlen =15.",
      });
    }

    let add = {};
    if (address) {
      if (
        address.pincode &&
        (address.pincode.toString().trim().length != 6 || isNaN(address.pincode))
      )
        return res
          .status(400)
          .send({ status: false, message: "Pincode must be of 6 digits." });

      if (address.city && !isValidName(address.city))
        return res
          .status(400)
          .send({ status: false, message: "Please provide valid city name." });


      if(address.pincode && address.pincode.trim()) add.pincode = address.pincode.trim();
      if(address.city && address.city.trim()) add.city = address.city.trim();
      if(address.street && address.street.trim()) add.street = address.street.trim();
    }

    let check = await userModel.findOne({ $or: [{ email }, { phone }] });
    if (check) {
      if (check.email == email) {
        return res
          .status(400)
          .send({ status: false, message: "This email is already exist." });
      }
      if (check.phone == phone) {
        return res
          .status(400)
          .send({ status: false, message: "This phone is already exist." });
      }
    }

    let create = await userModel.create({ ...data, address: add });

    res.status(201).send({ status: true, data: create });
  } catch (err) {
    res.status(500).send({ msg: err.message });
  }
};

//<-------------------------------------# LOGIN USER #------------------------------------->//

exports.loginUser = async function (req, res) {
  let body = req.body;
  let email = body.email;
  let password = body.password;
  if (Object.keys(body).length === 0)
    return res
      .status(400)
      .send({ status: false, message: "please provide email and password" });
  if (!email)
    return res
      .status(400)
      .send({ status: false, message: "plz provide email" });
  if (!password)
    return res
      .status(400)
      .send({ status: false, message: "plz provide password" });

  if (!isValidEmail(email))
    return res.status(400).send({
      status: false,
      message: "Invalid email, please provide valid email",
    });

  if (!isValidPassword(password))
    return res.status(400).send({
      status: false,
      message:
        "Password must contain at least 1 upperCase, 1 lowerCase and 1 special character, minlen = 8, maxlen =15.",
    });

  let user = await userModel.findOne({ email: email, password: password });
  if (!user)
    return res.status(404).send({ status: false, message: "login failed" });

  let token = jwt.sign(
    {
      id: user._id.toString(),
    },
    "Book-management-secure-key",
    { expiresIn: "10h" }
  );

  res.setHeader("x-api-key", token);
  res.status(200).send({
    status: true,
    message: "Success",
    data: { token: token, exp: "10h", userId: user._id, iat: moment() },
  });
};
