const axios = require("axios")
const generalLogger = require("../logging/generalLogger")(module)
const {validate_events, validate_locations} = require("./validations/meta")
require("dotenv").config();


/**
 * Controller to fetch Events information from Flask API and send to client
 * 
 * Validates and ensures correct format of response
 * 
 * Returns Event Info array from database
 */
const getEvents = (req, res, next) => {
    res.req.ip // TODO: Find out why this is necessary in all controllers but getEvents 
    generalLogger.info(`events list requested`)

    const uri = `${process.env.FLASK_API_URL}/meta/events?key=${process.env.FLASK_API_KEY}`

    axios.get(uri)
      // Fetch OK
      .then(response => {
        // Validate response data
        if (validate_events(response.data)){
          res.status(200).json(response.data)
        }
        else {
          res.status(500).json("Response from ML API did not pass validation checks")
        }
        next()
      })
      // Fetch ERROR, respond 500 and log error message
      .catch(error => {
          generalLogger.error(`error getting events: ${error}`)
          res.status(500).json({"error": error})
          next()
      });
}


/**
 * Controller to fetch Locations information from Flask API and send to client
 * 
 * Validates and ensures correct format of response
 * 
 * Returns Location Info array from database
 */
const getLocations = (req, res, next) => {
  res.req.ip // TODO: Find out why this is necessary in all controllers but getEvents 
  const uri = `${process.env.FLASK_API_URL}/meta/locations?key=${process.env.FLASK_API_KEY}`

  axios.get(uri)
    // Fetch OK
    .then(response => {
      // Validate response data
      if (validate_locations(response.data)){
        res.status(200).json(response.data)
      }
      else {
        res.status(500).json("Response from ML API did not pass validation checks")
      }
      next()
    })
    // Fetch ERROR, respond 500 and log error message
    .catch(error => {
        generalLogger.error(`error getting locations: ${error}`)
        res.status(500).json({"error": error})
        next()
    });
}

module.exports = {getEvents, getLocations};