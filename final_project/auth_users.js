const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  return !users.some(u => u.username === username);
};

const authenticatedUser = (username,password)=>{ //returns boolean
  return users.some(u => u.username === username && u.password === password);
};

//only registered users can login
regd_users.post("/login", (req,res) => {
  const {username, password} = req.body || {};

  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required."});
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({message: "Invalid username or password."});
  }

  const accessToken = jwt.sign({username}, "access", {expiresIn: "1h"});
  if (!req.session) {
    return res.status(500).json({message: "Session not initialized."})
  }

  req.session.authorization = {accessToken, username};
  return res.status(200).json({message: "Login successful", token: accessToken});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const {isbn} = req.params;
  const reviewText = req.params.review;

  const username = req.user?.username || req.session?.authorization?.username;

  if (!username) {
    return res.status(403).json({message: "User not authenticated."});
  }
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({message: 'No book found for ISBN ${isbn}.'});
  }
  if (!reviewText || reviewText.trim().length === 0) {
    return res.status(400).json({message: "Please provide a non-empty 'review' query parameter."});
  }

  if (!book.reviews) book.reviews = {};
  const isUpdate = Boolean(book.reviews[username]);

  book.reviews[username] = reviewText;
  return res.status(200).json({
    message: isUpdate ? "Review updated." : "Review added.",
    reviews: book.reviews
  });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const username = req.user?.username || req.session?.authorization?.username;

  if (!username) {
    return res.status(403).json({ message: "User not authenticated." });
  }
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: `No book found for ISBN ${isbn}.` });
  }
  if (!book.reviews || !book.reviews[username]) {
    return res.status(404).json({ message: "No existing review from this user to delete." });
  }

  delete book.reviews[username];
  return res.status(200).json({ message: "Review deleted.", reviews: book.reviews });
});



module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
