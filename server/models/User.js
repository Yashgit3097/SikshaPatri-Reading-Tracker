const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  smk: { type: String, unique: true, sparse: true },
  password: String,
  goal: Number,
  readCount: { type: Number, default: 0 },
  lastPageRead: { type: Number, default: 0 } // 👈 New field
});

module.exports = mongoose.model("User", userSchema);
