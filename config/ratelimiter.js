import rateLimit from "express-rate-limit";

export const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10000,
  standardHeaders: "draft-7",
  legacyHeaders: false
})  