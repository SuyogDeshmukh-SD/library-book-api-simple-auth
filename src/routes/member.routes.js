const express = require("express");
const Member = require("../models/Member");
const Loan = require("../models/Loan");
const router = express.Router();

// No authentication required in this simplified version.
router.post("/", async (req, res, next) => {
  try {
    const member = await Member.create(req.body);
    res.status(201).json({ success: true, message: "Member registered", data: member });
  } catch (e) { next(e); }
});

router.get("/", async (req, res, next) => {
  try {
    const members = await Member.find().sort({ createdAt: -1 });
    res.json({ success: true, count: members.length, data: members });
  } catch (e) { next(e); }
});

router.get("/:id/loans", async (req, res, next) => {
  try {
    const loans = await Loan.find({ member: req.params.id })
      .populate("book", "title author isbn")
      .populate("member", "name email")
      .sort({ createdAt: -1 });
    res.json({ success: true, count: loans.length, data: loans });
  } catch (e) { next(e); }
});

router.patch("/:id/status", async (req, res, next) => {
  try {
    const member = await Member.findByIdAndUpdate(
      req.params.id, { isActive: req.body.isActive }, { new: true, runValidators: true }
    );
    if (!member) return res.status(404).json({ success: false, message: "Member not found" });
    res.json({ success: true, message: "Member status updated", data: member });
  } catch (e) { next(e); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: "Member not found" });
    res.json({ success: true, data: member });
  } catch (e) { next(e); }
});

module.exports = router;
