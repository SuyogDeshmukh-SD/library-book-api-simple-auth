const mongoose = require("mongoose");

const loanSchema = new mongoose.Schema({
  book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
  member: { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true },
  issueDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  returnDate: { type: Date, default: null },
  status: { type: String, enum: ["issued", "returned"], default: "issued" },
  fineAmount: { type: Number, default: 0, min: 0 },
  finePaid: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Loan", loanSchema);
