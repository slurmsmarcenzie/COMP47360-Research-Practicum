const rateLimit = require("express-rate-limit")

/** 
 * Middleware function to limit the amount of requests from a given IP
 */
const rateLimiter = rateLimit({
	windowMs: 1 * 60 * 1000, // 1 min
	max: 30, // Limit to 30 requests per 1 min
	standardHeaders: true,
	legacyHeaders: false
})

module.exports = rateLimiter;