const axios = require("axios")
const generalLogger = require("../logging/generalLogger")(module)
const {validate_response_day, validate_response_hour} = require("./validations/busyness")
require("dotenv").config();


/**
 * Fetch event impact from the Prediction API
 * Event impact shows the busyness when the event is ongoing
 * 
 * Handles empty/undefined API response. 
 * 
 * Returns ML API dictionary results
 * 
 */
const eventImpact = (req, res, next) => {
  res.req.ip //sets the object
  let eventID = req.params.event
  generalLogger.info(`impact requested for event: ${eventID}`)

  const uri = `${process.env.FLASK_API_URL}/historic/${eventID}/impact?key=${process.env.FLASK_API_KEY}` 
  axios.get(uri)
    // Fetch OK
    .then(response => {
      // Validate response data
      if (validate_response_hour(response.data)){
        res.status(200).json(response.data)
      }
      else {
        res.status(500).json("Response from ML API did not pass validation checks")
      }
      next()
    })
    // Fetch ERROR, respond 500 and log error message
    .catch(error => {
      generalLogger.error(`error getting predictions: ${error}`)
      res.status(500).json({"error": error})
      next()
    });
}


/**
 * Fetch event baseline from the Prediction API
 * Event baseline shows the normal busyness when the event is not on
 * 
 * Handles empty/undefined API response. 
 * 
 * Returns ML API dictionary results
 * 
 */
const eventBaseline = (req, res, next) => {
  res.req.ip //sets the object
  let eventID = req.params.event
  generalLogger.info(`baseline requested for event: ${eventID}`)

  const uri = `${process.env.FLASK_API_URL}/historic/${eventID}/baseline?key=${process.env.FLASK_API_KEY}` 

  axios.get(uri)
    // Fetch OK
    .then(response => {
      // Validate response data
      if (validate_response_hour(response.data)){
        res.status(200).json(response.data)
      }
      else {
        res.status(500).json("Response from ML API did not pass validation checks")
      }
      next()
    })
    // Fetch ERROR, respond 500 and log error message
    .catch(error => {
      generalLogger.error(`error getting event baseline: ${error}`)
      res.status(500).json({"error": error})
      next()
    });
}


/**
 * Fetch event comparison from the Prediction API
 * Event comparison shows the difference between event impact and event baseline
 * 
 * Handles empty/undefined API response. 
 * 
 * Returns ML API dictionary results
 * 
 */
const eventComparison = (req, res, next) => {
  res.req.ip //sets the object
  let eventID = req.params.event
  generalLogger.info(`comparison requested for event: ${eventID}`)
  
  const uri = `${process.env.FLASK_API_URL}/historic/${eventID}/comparison?key=${process.env.FLASK_API_KEY}` 
  
  axios.get(uri)
    // Fetch OK
    .then(response => {
      // Validate response data
      if (validate_response_day(response.data)){
        res.status(200).json(response.data)
      }
      else {
        res.status(500).json("Response from ML API did not pass validation checks")
      }
      next()
    })
    // Fetch ERROR, respond 500 and log error message
    .catch(error => {
      generalLogger.error(`error getting event comparison: ${error.message}`)
      res.status(500).json({"error": error.message})
      next()
    });
}

/**
 * Fetch event timelapse from the Prediction API
 * Event timelapse shows the busyness for the 24hrs surrounding an event.
 * 
 * Handles empty/undefined API response. 
 * 
 * Returns ML API dictionary results
 * 
 */
const eventTimelapse = (req, res, next) => {
  res.req.ip //sets the object
  let eventID = req.params.event
  generalLogger.info(`timelapse requested for event: ${eventID}`)

  const uri = `${process.env.FLASK_API_URL}/historic/${eventID}/timelapse?key=${process.env.FLASK_API_KEY}` 

  axios.get(uri)
    // Fetch OK
    .then(response => {
      // Validate response data
      if (validate_response_day(response.data)){
        res.status(200).json(response.data)
      }
      else {
        res.status(500).json("Response from ML API did not pass validation checks")
      }
      next()
    })
    // Fetch ERROR, respond 500 and log error message
    .catch(error => {
      generalLogger.error(`error getting event timelapse: ${error.message}`)
      res.status(500).json({"error": error.message})
      next()
    });
}


module.exports = {eventImpact, eventBaseline, eventComparison, eventTimelapse};