import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { User } from "../../models/User.js";
import { config } from "../../config.js";

const router = Router();

router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ error: "Email already used" });

  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({
    email,
    passwordHash: hash,
    trialEndsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 روز تریال
  });

  const token = jwt.sign({ id: user._id }, config.jwtSecret);
  res.json({ token });
});

router.post("/register-consultant", async (req, res) => {
  const { email, password, topic } = req.body;

  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ error: "Email already used" });

  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({
    email,
    passwordHash: hash,
    role: "consultant",
    topic, // مثلا "Psychology"
  });

  const token = jwt.sign({ id: user._id }, config.jwtSecret);
  res.json({ token });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const user = await User.findOne({ email });
  if (!user || !user.passwordHash) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ id: user._id }, config.jwtSecret);
  res.json({ token });
});

export default router;
