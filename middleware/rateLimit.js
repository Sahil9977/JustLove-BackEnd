import rateLimit from 'express-rate-limit';

// Slows down love-code guessing and email spamming.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 15, standardHeaders: true, legacyHeaders: false,
  message: { error: 'Too many tries. Please wait a few minutes.' },
});
