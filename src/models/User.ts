// src/models/User.ts
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["user", "consultant"], default: "user" },
  topic: { type: String }, // فقط برای مشاور: مثلا Psychology
  trialEndsAt: { type: Date },
  subscription: {
    active: { type: Boolean, default: false },
    expiresAt: { type: Date, default: null },
  },
});

export const User = mongoose.model("User", userSchema);
