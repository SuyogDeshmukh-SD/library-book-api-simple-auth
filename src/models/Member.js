const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true, unique: true },
  phone: { type: String, trim: true, default: "" },
  membershipNumber: { type: String, unique: true, sparse: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Member", memberSchema);
