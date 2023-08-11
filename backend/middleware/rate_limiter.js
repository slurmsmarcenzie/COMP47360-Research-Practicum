//rate limitter 
const rateLimit = require("express-rate-limit")



// Below is commented out, it was just to allow me to keep checking with my ip without being blocked, put your ip in IPHERE if wish
// const allowedIP = "IPHERE"; 

// Custom function to skip rate limiting for your IP
// const skipRateLimitForIP = (req) => {
//   return req.ip === allowedIP;
// };



// Middleware function to limit the amount of requests from a given IP
const rateLimiter = rateLimit({
        windowMs: 1 * 60 * 1000, // 1 min
        max: 100, // Limit to 30 requests per 1 min
        skip: skipRateLimitForIP,
        standardHeaders: true,
        legacyHeaders: false
})

module.exports = rateLimiter;
