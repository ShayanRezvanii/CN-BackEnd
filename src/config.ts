// src/config.ts
import "dotenv/config";

export const config = {
  mongoUri: process.env.MONGO_URI!,
  jwtSecret: "super_secret_key",
  port: Number(process.env.PORT || 4000),
};

// ولیدیشن ساده
if (!process.env.MONGO_URI) {
  throw new Error("Missing MONGO_URI in .env");
}
if (/[<>]/.test(process.env.MONGO_URI)) {
  throw new Error("MONGO_URI contains '<' or '>' — remove placeholders.");
}
