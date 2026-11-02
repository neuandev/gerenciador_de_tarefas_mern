const mongoose = require("mongoose");

const dashboardSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 1, maxlength: 80 },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    coverUrl: { type: String, default: "", maxlength: 2000 },
    icon: { type: String, default: "📄", maxlength: 1400000 },
    isFavorite: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    position: { type: Number, default: 0 },
  },
  { timestamps: true },
);

dashboardSchema.index({ owner: 1, position: 1, createdAt: 1 });

module.exports = mongoose.model("Dashboard", dashboardSchema);
