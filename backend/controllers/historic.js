const axios = require("axios")
const generalLogger = require("../logging/generalLogger")(module)
require("dotenv").config();

//fetch event impact from ML API:
const eventImpact = (req, res, next) => {
  res.req.ip //sets the object
  let eventID = req.params.eventID
  generalLogger.info(`impact requested for event: ${eventID}`)

  const uri = `${process.env.FLASK_API_URL}/historic/${eventID}/impact?key=${process.env.FLASK_API_KEY}` 

  axios.get(uri)
    .then(response => {
      // Handle empty/null API result:
      if (response.data === null || response.data === undefined || response.data.length === 0){
        generalLogger.warn(`event impact list is empty: ${response.data}`)
        res.status(200).json([]);
        next()
      }
      else {
        // Ensure correct format of API result:
        const data = []
          for (item of response.data){
            if ("busyness_score" && "location_id" && "time" in item){
              data.push(item);
            }
            else {
              generalLogger.warn(`impact item skipped (incorrect format): ${item}`);
            }
          }
          generalLogger.info("event impact result is OK")
          res.status(200).json(data)
          next()
          
      }
    })
    // If error, respond 500 and log error message
    .catch(error => {
      generalLogger.error(`error getting predictions: ${error}`)
      res.status(500).json({"error": error})
      next()
    });
}


const eventBaseline = (req, res, next) => {
  res.req.ip //sets the object
  let eventID = req.params.eventID
  generalLogger.info(`baseline requested for event: ${eventID}`)

  const uri = `${process.env.FLASK_API_URL}/historic/${eventID}/baseline?key=${process.env.FLASK_API_KEY}` 

  axios.get(uri)
    .then(response => {
      // Handle empty/null API result:
      if (response.data === null || response.data === undefined || response.data.length === 0){
        generalLogger.warn(`events baseline list is empty: ${response.data}`)
        res.status(200).json([]);
        next()
      }
      else {
        // Ensure correct format of API result:
        const data = []
          for (item of response.data){
            if ("busyness_score" && "location_id" in item){
              data.push(item);
            }
            else {
              generalLogger.warn(`event baseline item skipped (incorrect format): ${item}`);
            }
          }
          generalLogger.info("event baseline result is OK")
          res.status(200).json(data)
          next()
          
      }
    })
    // If error, respond 500 and log error message
    .catch(error => {
      generalLogger.error(`error getting event baseline: ${error}`)
      res.status(500).json({"error": error})
      next()
    });
}

module.exports = {eventImpact, eventBaseline};