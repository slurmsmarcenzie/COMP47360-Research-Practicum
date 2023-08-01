const axios = require("axios");
const generalLogger = require("../logging/generalLogger")(module)
const {validate_response_hour} = require("./validations/validator")
require("dotenv").config();


/**
 * Fetch current busyness from the Prediction API
 * 
 * Returns ML API dictionary results
 */
const current = (req, res, next) => {
    res.req.ip //sets the object
    generalLogger.info(`current prediction requested`)

    const uri = `${process.env.FLASK_API_URL}/prediction/current?key=${process.env.FLASK_API_KEY}` 

    axios.get(uri)
      // Fetch OK
      .then(response => {
        // Validate response data
        if (validate_response_hour(response.data)){
          res.status(200).json(response.data)
        }
        else {
          res.status(500).json("Response data did not pass validation checks")
        }
        next()
      })
      // Fetch ERROR, respond 500 and log error message
      .catch(error => {
        generalLogger.error(`error getting prediction: ${error}`)
        res.status(500).json({"error": error})
        next()
      });
}




module.exports = {current};