// src/routes/auth/me.ts
import { Router } from "express";
import { middleware } from "../../middleware.js";

const router = Router();

// src/routes/auth/me.ts
router.get("/me", middleware, (req, res) => {
  const user = req.user!;
  const now = Date.now();
  const trialActive = !!user.trialEndsAt && user.trialEndsAt.getTime() > now;
  const subActive =
    !!user.subscription?.active &&
    !!user.subscription?.expiresAt &&
    user.subscription.expiresAt.getTime() > now;

  res.json({
    id: user._id,
    email: user.email,
    role: user.role, // 👈 اضافه کن
    trialEndsAt: user.trialEndsAt,
    subscription: user.subscription,
    access: trialActive || subActive ? "allowed" : "blocked",
  });
});

export default router;
