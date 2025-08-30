// src/index.ts
import express from "express";
import mongoose from "mongoose";
import { createServer } from "http";
import cors from "cors";
import { Server } from "socket.io";
import { config } from "./config.js";
import { Message } from "./models/Message.js";
import { authMiddlewareSocket } from "./socketAuth.js";
import roomsRoutes from "./routes/rooms/rooms.js";
import authRoutes from "./routes/auth/auth.js";
import meRoutes from "./routes/auth/me.js";
import { setupSwagger } from "./swagger.js";

const app = express();
app.use(cors());
app.use(express.json());
setupSwagger(app);

app.use("/auth", authRoutes);
app.use("/auth", meRoutes);
app.use("/rooms", roomsRoutes);

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

// middleware برای سوکت (auth با JWT)
io.use(authMiddlewareSocket);

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.data.user.email);

  // join روم
  socket.on("join_room", ({ roomId }) => {
    socket.join(roomId);
    console.log(`User ${socket.data.user.email} joined room ${roomId}`);
  });

  // دریافت پیام جدید
  socket.on("new_message", async ({ roomId, content }) => {
    if (!content?.trim()) return;

    // پیام کاربر
    const userMsg = await Message.create({
      roomId,
      userId: socket.data.user._id,
      from: "user",
      content: content.trim(),
    });

    io.to(roomId).emit("message_created", {
      id: userMsg._id,
      content: userMsg.content,
      from: "user",
      createdAt: userMsg.createdAt,
      roomId,
    });

    // پیام تستی مشاور
    const consultantMsg = await Message.create({
      roomId,
      from: "consultant",
      content: "Hi, how can I help you?",
    });

    io.to(roomId).emit("message_created", {
      id: consultantMsg._id,
      content: consultantMsg.content,
      from: "consultant",
      createdAt: consultantMsg.createdAt,
      roomId,
    });
  });
});

(async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log("✅ MongoDB connected");

    httpServer.listen(config.port, () => {
      console.log(`✅ Server running on http://localhost:${config.port}`);
    });
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  }
})();
