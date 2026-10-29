const express = require("express");
const mongoose = require("mongoose");
const Book = require("../models/Book");
const Member = require("../models/Member");
const Loan = require("../models/Loan");
const router = express.Router();

const LOAN_PERIOD_DAYS = Number(process.env.LOAN_PERIOD_DAYS || 14);
const FINE_PER_DAY = Number(process.env.FINE_PER_DAY || 5);

// Issue a book by providing bookId and memberId in the JSON body.
router.post("/issue", async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    const { bookId, memberId } = req.body;
    if (!bookId || !memberId) {
      return res.status(400).json({ success: false, message: "bookId and memberId are required" });
    }

    let createdLoan;
    await session.withTransaction(async () => {
      const book = await Book.findOne({ _id: bookId, isActive: true }).session(session);
      if (!book) {
        const err = new Error("Book not found"); err.status = 404; throw err;
      }
      const member = await Member.findOne({ _id: memberId, isActive: true }).session(session);
      if (!member) {
        const err = new Error("Active member not found"); err.status = 404; throw err;
      }
      if (book.availableCopies < 1) {
        const err = new Error("No copies available"); err.status = 409; throw err;
      }

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + LOAN_PERIOD_DAYS);
      const [loan] = await Loan.create([{
        book: book._id, member: member._id, dueDate
      }], { session });
      book.availableCopies -= 1;
      await book.save({ session });
      createdLoan = loan;
    });

    const result = await Loan.findById(createdLoan._id)
      .populate("book", "title author isbn")
      .populate("member", "name email");
    res.status(201).json({ success: true, message: "Book issued successfully", data: result });
  } catch (e) {
    next(e);
  } finally {
    await session.endSession();
  }
});

// Track all loans. Optional: ?status=issued or ?status=returned
router.get("/", async (req, res, next) => {
  try {
    const filter = {};
    if (["issued", "returned"].includes(req.query.status)) filter.status = req.query.status;
    if (req.query.memberId) filter.member = req.query.memberId;
    if (req.query.bookId) filter.book = req.query.bookId;
    const loans = await Loan.find(filter)
      .populate("book", "title author isbn")
      .populate("member", "name email membershipNumber")
      .sort({ createdAt: -1 });
    res.json({ success: true, count: loans.length, data: loans });
  } catch (e) { next(e); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.id)
      .populate("book", "title author isbn")
      .populate("member", "name email membershipNumber");
    if (!loan) return res.status(404).json({ success: false, message: "Loan not found" });
    res.json({ success: true, data: loan });
  } catch (e) { next(e); }
});

router.patch("/:id/return", async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    let returnedLoan;
    await session.withTransaction(async () => {
      const loan = await Loan.findById(req.params.id).session(session);
      if (!loan) {
        const err = new Error("Loan not found"); err.status = 404; throw err;
      }
      if (loan.status === "returned") {
        const err = new Error("This loan has already been returned"); err.status = 409; throw err;
      }

      const now = new Date();
      const overdueDays = Math.max(0, Math.ceil((now - loan.dueDate) / (1000 * 60 * 60 * 24)));
      loan.returnDate = now;
      loan.status = "returned";
      loan.fineAmount = overdueDays * FINE_PER_DAY;
      loan.finePaid = loan.fineAmount === 0;
      await loan.save({ session });

      const book = await Book.findById(loan.book).session(session);
      if (book) {
        book.availableCopies = Math.min(book.totalCopies, book.availableCopies + 1);
        await book.save({ session });
      }
      returnedLoan = loan;
    });

    const result = await Loan.findById(returnedLoan._id)
      .populate("book", "title author isbn")
      .populate("member", "name email");
    res.json({ success: true, message: "Book returned successfully", data: result });
  } catch (e) {
    next(e);
  } finally {
    await session.endSession();
  }
});

router.patch("/:id/fine-paid", async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).json({ success: false, message: "Loan not found" });
    if (loan.status !== "returned") {
      return res.status(400).json({ success: false, message: "Return the book before settling the fine" });
    }
    loan.finePaid = true;
    await loan.save();
    res.json({ success: true, message: "Fine marked as paid", data: loan });
  } catch (e) { next(e); }
});

module.exports = router;
