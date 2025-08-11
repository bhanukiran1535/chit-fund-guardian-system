
const rateLimit = require('express-rate-limit');

const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { success: false, message },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts
  'Too many authentication attempts, please try again later'
);

const otpLimiter = createRateLimiter(
  60 * 1000, // 1 minute
  3, // 3 attempts
  'Too many OTP requests, please try again later'
);

module.exports = { authLimiter, otpLimiter };
