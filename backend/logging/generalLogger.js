const winston = require("winston");
const {transports, format} = winston;
const path = require("path")

var formatLabel = function (callingModule) {
    var parts = callingModule.filename.split(path.sep);
    const newparts = parts[parts.length - 2] + path.sep + parts.pop();  //note fix this to work with all OS
    return newparts
};

//Format for general logging
const generalFormat = format.printf(({ level, timestamp, label, message}) => {
    return `[${level}] ${timestamp} [${label}] ${message}`;
  });

const generalLogger = function(callingModule){
    return winston.createLogger({
        level: "debug", //Means logs with lower priority than "info" will be ignored.
        transports: [
            // Write all logs with priority of `warn` or more to `priority.log`
            new transports.File({filename: "logging/logs/priority.log", level: "warn"}),
            // Write all logs with priority of debug or more to `general.log`
            new transports.File({filename: "logging/logs/general.log"})
        ],
        format:  format.combine(
            format.errors({ stack: true }),
            format.label({label: formatLabel(callingModule)}),
            format.timestamp(),
            format.json(),
            generalFormat
        )
    });
}

module.exports = generalLogger;