const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, default: "", maxlength: 1000 },
    status: { type: String, enum: ["pendente", "concluída"], default: "pendente" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    dashboard: { type: mongoose.Schema.Types.ObjectId, ref: "Dashboard", default: null, index: true },
    position: { type: Number, default: 0 },
  },
  { timestamps: true },
);

taskSchema.index({ user: 1, dashboard: 1, position: 1 });

module.exports = mongoose.model("Task", taskSchema);
