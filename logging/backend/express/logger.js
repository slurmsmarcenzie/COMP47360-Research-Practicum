const winston = require("winston");
const {transports, format} = winston;

const PATH = "../logging/backend/express/logs";

const myFormat = format.printf(({ level, message, timestamp }) => {
    return `[${level}] ${timestamp}  ${message}`;
  });

const logger = winston.createLogger({
    level: "debug", //Means logs with lower priority than "info" will be ignored.
    transports: [
        // Write all logs with priority of `error` or more to `error.log`
        new transports.File({filename: `${PATH}/error.log`, level: "error"}),
        // Write all logs with priority of `warn` or more to `warning.log`
        new transports.File({filename: `${PATH}/warning.log`, level: "warn"}),
        // Write all logs with priority of debug or more to `general.log`
        new transports.File({filename: `${PATH}/general.log`})
    ],
    format:  format.combine(
        format.timestamp(),
        format.json(),
        myFormat
    )
});

const httpLogger = winston.createLogger({
    level: "debug",
    transports: [
        new transports.File({filename: "../logging/backend/express/logs/http.log"})
    ],
    format:  format.combine(
        format.timestamp(),
        format.json(),
        myFormat
    )

});


//Further loggers to be implemented:
// Perfomance Logger
// React Logger?

module.exports = {logger, httpLogger}