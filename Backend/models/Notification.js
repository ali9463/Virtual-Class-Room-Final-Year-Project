const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String },
  type: { type: String },
  link: { type: String },
  targetClass: { type: String }, // e.g. 2024-CSE-A
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Notification", NotificationSchema);
