// src/socketAuth.ts
import jwt from "jsonwebtoken";
import { config } from "./config.js";
import { User } from "./models/User.js";
import type { Socket } from "socket.io";

type JwtUserPayload = jwt.JwtPayload & { id?: string };

export function authMiddlewareSocket(
  socket: Socket,
  next: (err?: Error) => void
): void {
  (async () => {
    try {
      const token = socket.handshake.auth?.token as string | undefined;
      if (!token) return next(new Error("No token"));

      const decoded = jwt.verify(token, config.jwtSecret) as JwtUserPayload;
      if (!decoded?.id) return next(new Error("Invalid token"));

      const user = await User.findById(decoded.id);
      if (!user) return next(new Error("User not found"));

      // trial/subscription check
      const now = Date.now();
      const trialOk = !!user.trialEndsAt && user.trialEndsAt.getTime() > now;
      const subOk =
        !!user.subscription?.active &&
        !!user.subscription?.expiresAt &&
        user.subscription.expiresAt.getTime() > now;

      if (!trialOk && !subOk) return next(new Error("Subscription required"));

      // attach user to socket
      (socket.data as any).user = user;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  })();
}
