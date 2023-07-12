const rateLimit = require("express-rate-limit")

const rateLimiter = rateLimit({
	windowMs: 1 * 60 * 1000, // 1 min
	max: 10, // Limit to 10 requests per minute
	standardHeaders: true,
	legacyHeaders: false
})

module.exports = rateLimiter;