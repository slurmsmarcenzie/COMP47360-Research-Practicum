const axios = require("axios");
const generalLogger = require("../logging/generalLogger")(module)
require("dotenv").config();


//fetch current prediction from ML API:
const current = (req, res, next) => {
    res.req.ip //sets the object
    generalLogger.info(`current prediction requested`)

    const uri = `${process.env.FLASK_API_URL}/prediction/current?key=${process.env.FLASK_API_KEY}` 

    axios.get(uri)
      .then(response => {
        // Handle empty/null API result:
        if (response.data === null || response.data === undefined || response.data.length === 0){
          generalLogger.warn("warning, prediction list is empty")
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
                generalLogger.warn("warning: prediction item skipped (incorrect format)");
              }
            }
            generalLogger.info("response is OK")
            res.status(200).json(data)
            next()
        }
      })
      // If error, respond 500 and log error message
      .catch(error => {
        generalLogger.error(`error getting prediction: ${error}`)
        res.status(500).json({"error": error})
        next()
      });
}


//fetch current prediction from ML API:
const event = (req, res, next) => {
  res.req.ip //sets the object
  let eventID = req.params.eventID
  generalLogger.info(`event prediction requested`)

  const uri = `${process.env.FLASK_API_URL}/prediction/event/${eventID}?key=${process.env.FLASK_API_KEY}` 

  axios.get(uri)
    .then(response => {
      // Handle empty/null API result:
      if (response.data === null || response.data === undefined || response.data.length === 0){
        generalLogger.warn("warning, prediction list is empty")
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
              generalLogger.warn("warning: prediction item skipped (incorrect format)");
            }
          }
          generalLogger.info("response is OK")
          res.status(200).json(data)
          next()
      }
    })
    // If error, respond 500 and log error message
    .catch(error => {
      generalLogger.error(`error getting prediction: ${error}`)
      res.status(500).json({"error": error})
      next()
    });
}

module.exports = {current, event};