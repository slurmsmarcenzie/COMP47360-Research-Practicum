const axios = require("axios")
const generalLogger = require("../logging/generalLogger")(module)
require("dotenv").config();

//fetch event impact from ML API:
const eventImpact = (req, res, next) => {
  res.req.ip //sets the object
  let eventID = req.params.event
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
        generalLogger.info("event impact result is OK")
        res.status(200).json(response.data)
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
  let eventID = req.params.event
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
        generalLogger.info("event baseline result is OK")
        res.status(200).json(response.data)
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

const eventComparison = (req, res, next) => {
  res.req.ip //sets the object
  let eventID = req.params.event
  generalLogger.info(`comparison requested for event: ${eventID}`)
  
  const uri = `${process.env.FLASK_API_URL}/historic/${eventID}/comparison?key=${process.env.FLASK_API_KEY}` 
  
  axios.get(uri)
    .then(response => {
      // Handle empty/null API result:
      if (response.data === null || response.data === undefined || response.data.length === 0){
        generalLogger.warn(`events comparison list is empty: ${response.data}`)
        res.status(200).json([]);
        next()
      }
      else {
        generalLogger.info("event comparison result is OK")
        res.status(200).json(response.data)
        next()   
      }
    })
    // If error, respond 500 and log error message
    .catch(error => {
      generalLogger.error(`error getting event comparison: ${error.message}`)
      res.status(500).json({"error": error.message})
      next()
    });
}

const eventTimelapse = (req, res, next) => {
  res.req.ip //sets the object
  let eventID = req.params.event
  generalLogger.info(`timelapse requested for event: ${eventID}`)

  const uri = `${process.env.FLASK_API_URL}/historic/${eventID}/timelapse?key=${process.env.FLASK_API_KEY}` 

  axios.get(uri)
    .then(response => {
      generalLogger.info(`${response} - loggin response`)
      // Handle empty/null API result:
      if (response.data === null || response.data === undefined || response.data.length === 0){
        generalLogger.warn(`events comparison list is empty: ${response.data}`)
        res.status(200).json([]);
        next()
      }
      else {
        generalLogger.info("event timelapse result is OK")
        res.status(200).json(response.data)
        next()   
      }
    })
    // If error, respond 500 and log error message
    .catch(error => {
      generalLogger.error(`error getting event comparison: ${error.message}`)
      res.status(500).json({"error": error.message})
      next()
    });
}

module.exports = {eventImpact, eventBaseline, eventComparison, eventTimelapse};