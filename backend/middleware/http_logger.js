const {httpLogger} = require("../../logging/backend/express/logger")

const http_logger = (req, res, next) => {
    if (res.statusCode < 400){
        httpLogger.info(res);
    } else {
        httpLogger.error(res);
    }
}

module.exports = http_logger;