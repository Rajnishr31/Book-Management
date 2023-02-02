const mongoose = require("mongoose");
const moment = require("moment");

//Title validation

const isValidTitle = function (title) {
  let arr = ["Mr", "Mrs", "Miss"];
  let valid = false;
  arr.forEach((x) => {
    if (x == title) valid = true;
  });
  return valid;
};

//Name Validation

const isValidName = function (name) {
  const nameRegex = /^[a-zA-Z ]+$/;
  return nameRegex.test(name);
};

//Email Validation

const isValidEmail = function (email) {
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,6})+$/;
  // /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailRegex.test(email);
};

//Password Validation

const isValidPassword = function (password) {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/;
  return passwordRegex.test(password);
};

// Phone Validation
const isValidPhone = function (phone) {
  const phoneRegex = /^(0|91)?[6-9][0-9]{9}$/;
  return phoneRegex.test(phone);
};

/*-----------------------------------BOOK TITLE VALIDATION -----------------------------------------------------*/

const isValid = function (name) {
  const nameRegex = /^[A-Za-z]+\s*[A-Za-z0-9 -:]{1,}/;
  return nameRegex.test(name);
};

/*---------------------------------------------ISBN VALIDATION-------------------------------------------*/

const isVAlidISBN = function (ISBN) {
  const ISBNRegex = /^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/;
  return ISBNRegex.test(ISBN);
};

/*--------------------------------------------- DATE VALIDATION-------------------------------------------*/

const isVAlidDate = function (releasedAt) {
  let abc = moment(releasedAt, "YYYY-MM-DD", true).isValid();
  return abc;
};

module.exports = {
  isValidTitle,
  isValidName,
  isValidEmail,
  isValidPhone,
  isValidPassword,
  isValid,
  isVAlidISBN,
  isVAlidDate,
};