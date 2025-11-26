const mongoose = require("mongoose");

const deptSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true }, // e.g., BCS, BSE
    label: { type: String, required: true }, // e.g., "Bachelor of Computer Science"
  },
  { timestamps: true }
);

module.exports = mongoose.model("Department", deptSchema);
