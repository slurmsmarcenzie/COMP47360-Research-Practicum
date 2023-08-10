const winston = require("winston");
const {transports, format} = winston;

/**
 * Format for logging http request/response
 * 
 * [level] 'datetime' | 'request IP' | 'request method' 'URL requested' | 'status code'
 */
const httpFormat = format.printf(({ level, timestamp, message}) => {
    return `[${level}] ${timestamp} | ${message.req.ip} | ${message.req.method} '${message.req.originalUrl}' | ${message.statusCode}`;
});



/**
 * A logger built with Winston to log http request and response info
 * 
 * Automatically creates http.log file in logging folder and transports new logs there
 */
const httpLogger = winston.createLogger({
    level: "debug",
    transports: [
        new transports.File({filename: "logging/logs/http.log"})
    ],
    format:  format.combine(
        format.errors({ stack: true }),
        format.timestamp(),
        format.json(),
        httpFormat
    )

});

module.exports = httpLogger;