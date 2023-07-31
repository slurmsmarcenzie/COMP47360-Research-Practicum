const axios = require("axios")
const generalLogger = require("../logging/generalLogger")(module)
require("dotenv").config();


/**
 * Controller to fetch Events information from Flask API and send to client
 * 
 * Validates and ensures correct format of response
 * 
 * Returns Event Info dictionary from database
 */
const getEvents = (req, res, next) => {
    res.req.ip // TODO: Find out why this is necessary in all controllers but getEvents 
    const uri = `${process.env.FLASK_API_URL}/info/events?key=${process.env.FLASK_API_KEY}`

    axios.get(uri)
      .then(response => {
          // Handle empty/null API result:
          if (response.data === null || response.data === undefined){
            generalLogger.warn("warning, event list is empty")
            res.status(200).json([]);
          } 
          else {
            // Ensure correct format of API result:
            const data = []
            for (item of response.data){
              if ("id" && "location" && "name"  && "size" in item){
                data.push(item);
              }
              else {
                generalLogger.warn("warning: event skipped (incorrect format)");
              }
            }
            generalLogger.info("response is OK")
            res.status(200).json(data)
            next()
          }
      })
      // If error, respond 500 and log error message
      .catch(error => {
          generalLogger.error(`error getting events: ${error}`)
          res.status(500).json({"error": error})
          next()
      });
}

module.exports = {getEvents};