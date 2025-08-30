// src/models/Room.ts
import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    topic: { type: String, required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const Room = mongoose.model("Room", roomSchema);
