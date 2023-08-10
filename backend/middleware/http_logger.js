const httpLogger = require("../logging/httpLogger")

/** 
 * Middleware function to log HTTP information for each req/res 
 * 
 * See 'logging/httpLogger' for more information
 */
const http_logger = (req, res, next) => {
    if (res.statusCode < 400){
        httpLogger.info(res);
    } else {
        httpLogger.error(res);
    }
}

module.exports = http_logger;