const winston = require("winston");
const {transports, format} = winston;

//Format for logging http  request/respons
const httpFormat = format.printf(({ level, timestamp, message}) => {
    return `[${level}] ${timestamp} | ${message.req.ip} | ${message.req.method} '${message.req.originalUrl}' | ${message.statusCode}`;
});


const httpLogger = winston.createLogger({
    level: "debug",
    transports: [
        new transports.File({filename: "logs/http.log"})
    ],
    format:  format.combine(
        format.errors({ stack: true }),
        format.timestamp(),
        format.json(),
        httpFormat
    )

});

module.exports = httpLogger;