// src/models/Message.ts
import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
      index: true,
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    from: { type: String, enum: ["user", "consultant"], required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

export const Message = mongoose.model("Message", MessageSchema);
