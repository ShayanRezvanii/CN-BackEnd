import { Router } from "express";
import { Room } from "../../models/Room.js";
import { Message } from "../../models/Message.js";
import { middleware } from "../../middleware.js";
const router = Router();

router.post("/", middleware, async (req, res) => {
  const { topic } = req.body;
  if (!topic) return res.status(400).json({ error: "topic required" });

  // چک روم موجود
  let room = await Room.findOne({ topic, ownerId: req.user!._id });
  if (room) {
    return res.json({ id: room._id.toString(), topic: room.topic });
  }

  // ساخت روم جدید
  room = await Room.create({ topic, ownerId: req.user!._id });
  res.json({ id: room._id.toString(), topic: room.topic });
});

// src/routes/rooms/rooms.ts
router.get("/:roomId/messages", middleware, async (req, res) => {
  const { roomId } = req.params;
  const messages = await Message.find({ roomId }).sort({ createdAt: 1 }).lean();

  res.json(
    messages.map((m) => ({
      id: m._id.toString(), // 👈 اینجا
      content: m.content,
      from: m.from,
      createdAt: m.createdAt,
    }))
  );
});

// POST پیام
router.post("/:roomId/messages", middleware, async (req, res) => {
  const { roomId } = req.params;
  const { content } = req.body;

  if (!content?.trim())
    return res.status(400).json({ error: "content required" });

  const from = req.user!.role === "consultant" ? "consultant" : "user";

  const msg = await Message.create({
    roomId,
    userId: req.user!._id,
    from,
    content: content.trim(),
  });
  console.log(msg);

  res.json({
    id: msg._id.toString(), // 👈 اینجا
    content: msg.content,
    from: msg.from,
    createdAt: msg.createdAt,
  });
});

// همه روم‌ها برای مشاور (بر اساس category یا کل)
router.get("/consultant/my-rooms", middleware, async (req, res) => {
  if (req.user!.role !== "consultant") {
    return res.status(403).json({ error: "Access denied" });
  }

  // فعلا ساده: همه روم‌ها رو بده
  const rooms = await Room.find().sort({ createdAt: -1 }).lean();

  res.json(
    rooms.map((r) => ({
      id: r._id.toString(),
      topic: r.topic,
      createdAt: r.createdAt,
    }))
  );
});

router.delete("/:roomId", middleware, async (req, res) => {
  const { roomId } = req.params;

  await Message.deleteMany({ roomId });
  await Room.findByIdAndDelete(roomId);

  res.json({ success: true });
});

export default router;
