import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "./models/User.js";
import { config } from "./config.js";

type JwtUserPayload = jwt.JwtPayload & { id?: string };

export async function middleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const auth = req.headers.authorization ?? "";
  if (!auth.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token" });
  }

  const token = auth.slice(7).trim();
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as JwtUserPayload;
    if (!decoded?.id) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ error: "User not found" });

    // 🔥 اگه مشاور بود، نیازی به تریال/ساب نیست
    if (user.role === "consultant") {
      req.user = user;
      return next();
    }

    const now = Date.now();
    const hasTrial = !!user.trialEndsAt && user.trialEndsAt.getTime() > now;
    const hasSubscription =
      !!user.subscription?.active &&
      !!user.subscription?.expiresAt &&
      user.subscription.expiresAt.getTime() > now;

    if (!hasTrial && !hasSubscription) {
      return res.status(402).json({ error: "Subscription required" });
    }

    req.user = user;
    return next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: "Token expired" });
    }
    return res.status(401).json({ error: "Invalid token" });
  }
}
