const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  author: { type: String, required: true, trim: true },
  isbn: { type: String, trim: true, unique: true, sparse: true },
  category: { type: String, trim: true, default: "General" },
  totalCopies: { type: Number, required: true, min: 1, default: 1 },
  availableCopies: { type: Number, min: 0 },
  publishedYear: { type: Number },
  description: { type: String, default: "" },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

bookSchema.pre("validate", function(next) {
  if (this.isNew && this.availableCopies == null) this.availableCopies = this.totalCopies;
  if (this.availableCopies > this.totalCopies) {
    return next(new Error("Available copies cannot exceed total copies"));
  }
  next();
});

module.exports = mongoose.model("Book", bookSchema);
