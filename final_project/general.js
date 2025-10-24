// router/general.js
const express = require('express');
const public_users = express.Router();

let books = require("./booksdb.js");                    
let isValid = require("./auth_users.js").isValid;         
let users = require("./auth_users.js").users;

const axios = require('axios');

function baseURL(req) {
  return `${req.protocol}://${req.get('host')}`;
}

/**
 * Task 10: Get all books using async/await + Axios
 * GET /axios/books
 */
public_users.get('/axios/books', async (req, res) => {
  try {
    const { data } = await axios.get(`${baseURL(req)}/`);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch books via Axios', error: err.message });
  }
});

/**
 * Task 11: Get book details by ISBN using async/await + Axios
 * GET /axios/isbn/:isbn
 */
public_users.get('/axios/isbn/:isbn', async (req, res) => {
  try {
    const { isbn } = req.params;
    const { data } = await axios.get(`${baseURL(req)}/isbn/${isbn}`);
    return res.status(200).json(data);
  } catch (err) {
    const status = err.response?.status || 500;
    return res.status(status).json({ message: 'Failed to fetch by ISBN via Axios', error: err.message });
  }
});

/**
 * Task 12: Get books by Author using async/await + Axios
 * GET /axios/author/:author
 */
public_users.get('/axios/author/:author', async (req, res) => {
  try {
    const { author } = req.params;
    const { data } = await axios.get(`${baseURL(req)}/author/${encodeURIComponent(author)}`);
    return res.status(200).json(data);
  } catch (err) {
    const status = err.response?.status || 500;
    return res.status(status).json({ message: 'Failed to fetch by author via Axios', error: err.message });
  }
});

/**
 * Task 13: Get books by Title using async/await + Axios
 * GET /axios/title/:title
 */
public_users.get('/axios/title/:title', async (req, res) => {
  try {
    const { title } = req.params;
    const { data } = await axios.get(`${baseURL(req)}/title/${encodeURIComponent(title)}`);
    return res.status(200).json(data);
  } catch (err) {
    const status = err.response?.status || 500;
    return res.status(status).json({ message: 'Failed to fetch by title via Axios', error: err.message });
  }
});

/**
 * Task 6: Register a new user
 */
public_users.post("/register", (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  if (!isValid(username)) {
    return res.status(409).json({ message: "Username already exists." });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User successfully registered. Now you can login." });
});

/**
 * Task 1: Get the book list (pretty-printed)
 */
public_users.get('/', (req, res) => {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

/**
 * Task 2: Get book details by ISBN
 */
public_users.get('/isbn/:isbn', (req, res) => {
  const { isbn } = req.params;
  const book = books[isbn];
  if (!book) return res.status(404).json({ message: `No book found for ISBN ${isbn}.` });
  return res.status(200).json(book);
});

/**
 * Task 3: Get book details by author
 */
public_users.get('/author/:author', (req, res) => {
  const { author } = req.params;
  const matches = Object.keys(books)
    .map(k => ({ isbn: k, ...books[k] }))
    .filter(b => b.author && b.author.toLowerCase() === author.toLowerCase());

  if (matches.length === 0) {
    return res.status(404).json({ message: `No books found for author "${author}".` });
  }
  return res.status(200).json(matches);
});

/**
 * Task 4: Get books by title
 */
public_users.get('/title/:title', (req, res) => {
  const { title } = req.params;
  const matches = Object.keys(books)
    .map(k => ({ isbn: k, ...books[k] }))
    .filter(b => b.title && b.title.toLowerCase() === title.toLowerCase());

  if (matches.length === 0) {
    return res.status(404).json({ message: `No books found with title "${title}".` });
  }
  return res.status(200).json(matches);
});

/**
 * Task 5: Get book reviews by ISBN
 */
public_users.get('/review/:isbn', (req, res) => {
  const { isbn } = req.params;
  const book = books[isbn];
  if (!book) return res.status(404).json({ message: `No book found for ISBN ${isbn}.` });
  return res.status(200).json(book.reviews || {});
});

module.exports.general = public_users;
