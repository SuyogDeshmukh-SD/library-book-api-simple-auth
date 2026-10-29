const express = require("express");
const Book = require("../models/Book");
const Loan = require("../models/Loan");
const router = express.Router();

// Anyone can list books.
router.get("/", async (req, res, next) => {
  try {
    const { search, category } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = new RegExp(category, "i");
    if (search) filter.$or = [
      { title: new RegExp(search, "i") },
      { author: new RegExp(search, "i") },
      { isbn: new RegExp(search, "i") }
    ];
    const books = await Book.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: books.length, data: books });
  } catch (e) { next(e); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const book = await Book.findOne({ _id: req.params.id, isActive: true });
    if (!book) return res.status(404).json({ success: false, message: "Book not found" });
    res.json({ success: true, data: book });
  } catch (e) { next(e); }
});

// Simple learning/demo API: no login or Bearer token required.
router.post("/", async (req, res, next) => {
  try {
    const book = await Book.create(req.body);
    res.status(201).json({ success: true, message: "Book created", data: book });
  } catch (e) { next(e); }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    });
    if (!book) return res.status(404).json({ success: false, message: "Book not found" });
    res.json({ success: true, message: "Book updated", data: book });
  } catch (e) { next(e); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!book) return res.status(404).json({ success: false, message: "Book not found" });
    res.json({ success: true, message: "Book removed from catalogue", data: book });
  } catch (e) { next(e); }
});

module.exports = router;
