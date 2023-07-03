const winston = require("winston");
const {transports, format} = winston;

const PATH = "../logging/backend/express/logs";

//Format for general logging
const generalFormat = format.printf(({ level, timestamp, message}) => {
    return `[${level}] ${timestamp}  ${message}`;
  });

//Format for logging http  request/respons
const httpFormat = format.printf(({ level, timestamp, message}) => {
    return `[${level}] ${timestamp} | ${message.req.ip} | ${message.req.method} '${message.req.originalUrl}' | ${message.statusCode}`;
});

const generalLogger = winston.createLogger({
    level: "debug", //Means logs with lower priority than "info" will be ignored.
    transports: [
        // Write all logs with priority of `warn` or more to `priority.log`
        new transports.File({filename: `${PATH}/priority.log`, level: "warn"}),
        // Write all logs with priority of debug or more to `general.log`
        new transports.File({filename: `${PATH}/general.log`})
    ],
    format:  format.combine(
        format.errors({ stack: true }),
        format.timestamp(),
        format.json(),
        generalFormat
    )
});

const httpLogger = winston.createLogger({
    level: "debug",
    transports: [
        new transports.File({filename: "../logging/backend/express/logs/http.log"})
    ],
    format:  format.combine(
        format.errors({ stack: true }),
        format.timestamp(),
        format.json(),
        httpFormat
    )

});

//Further loggers to be implemented:
// Perfomance Logger
// React Logger?

module.exports = {generalLogger, httpLogger}