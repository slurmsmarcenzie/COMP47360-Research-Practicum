const generalLogger = require("../../logging/generalLogger")(module)
const {LOCATIONS, TIMES, RANGE} = require("./data")

/**
 * A function that makes validaton checks on the response data (for each hour of day)
 * 
 * Logs the result of each check
 * Returns False if a high priority check fails
 * Returns True otherwise (result is usable)
 * 
 * @param {dictionary} response_data 
 * @returns {boolean} 
 */
const validate_response_day = (response_data) => {
  const hourKeys = Object.keys(response_data)

  // Check if response contains no data
  if (response_data === null || response_data === undefined || hourKeys.length == 0){
    generalLogger.error(`response result is empty`)
    return false
  }

  // Check that keys are String hours of day (0 - 23) and nothing else
  for (key of hourKeys){
    // is key a numeric string
    if (typeof key != "string" || isNaN(key) || isNaN(parseInt(key))) {
      generalLogger.error(`hour key ${key} is not a numeric string`)
      return false
    }
    // is key an int between 0 and 23
    const num = parseInt(key)
    if (num < 0 || num > 23){
      generalLogger.error(`hour key ${key} is not an accepted hour of the day`)
      return false
    }
  }
  
  // Check HOUR keys (min amount)
  if (hourKeys.length < TIMES.HourNumMin){
    const missing = TIMES.HourNumExpected - hourKeys.length
    generalLogger.warn(`response result contains too few hours. missing: ${missing}`)
    return false
  }

  // Check HOUR keys (expected amount)
  if (hourKeys.length != TIMES.HourNumExpected){
    generalLogger.warn(`response result contains unexpected number of hours: ${hourKeys.length} of ${TIMES.HourNumExpected}`)
  }

  // Check the results within each hour of day
  for (key of hourKeys){
    generalLogger.info(`response (full-day) validation check. Hour: ${key}`)
    validate_response_hour(response_data[key])
  }

  // Response is usable
  generalLogger.info("response result is OK")
  return true
}


/**
 * A function that makes validaton checks on the response data (specific hour)
 * 
 * Logs the result of each check
 * Returns False if a high priority check fails
 * Returns True otherwise (result is usable)
 * 
 * @param {dictionary} response_data 
 * @returns {boolean} 
 */
const validate_response_hour = (response_data) => {
  const locationKeys = Object.keys(response_data)

  // Check if response contains no data
  if (response_data === null || response_data === undefined || locationKeys.length == 0){
    generalLogger.error(`response result is empty.`)
    return false
  }

  // Check the minimum acceptable number of location keys
  if (locationKeys.length < LOCATIONS.LocNumMin){
    generalLogger.error(`response result is too small. size: ${locationKeys.length}`)
    return false
  }

  // Check if expected number of locations returned
  if (locationKeys.length != LOCATIONS.LocNumExpected){
    generalLogger.warn(`response result is unexpected size: ${locationKeys.length}`)
  }

  // Check how many of the keys are valid String location IDs
  let counter = 0 
  for (locID of locationKeys){
    if (typeof locID != "string"){
      generalLogger.error(`location key ${locID} is not a string`)
      return false
    }
    if (LOCATIONS.LocKeys.includes(locID)){
      counter++
    } 
  }
  // If too many are not valid, fail
  if (counter < LOCATIONS.LocNumMin){
    generalLogger.error(`response contains too many incorrect locations: ${locationKeys}`)
    return false
  }

  for (key of locationKeys){
    let score = response_data[key]
    // Check that busyness scores are numbers
    if (isNaN(score)){
      generalLogger.error(`response contains non-numerical busyness score: ${score}`)
      return false
    }
    // Check that busyness scores are in the range -1 to +1
    if (score < RANGE.min || score > RANGE.max){
      generalLogger.error(`response contains busyness score outside of range 0 - 1: ${score}`)
      return false
    }
  }

  // Response is usable
  generalLogger.info("response result is OK")
  return true

}

module.exports = {validate_response_day, validate_response_hour}

