const {LOCATIONS} = require("./data")
const generalLogger = require("../../logging/generalLogger")(module)


/**
 * A function that makes validaton checks on the response data (events)
 * 
 * Logs the result of each check
 * Returns False if a high priority check fails
 * Returns True otherwise (result is usable)
 * 
 * @param {dictionary} response_data 
 * @returns {boolean} 
 */
const validate_events = (response_data) =>  {

    // Check if response contains no data
    if (response_data === null || response_data === undefined || response_data.length == 0){
        generalLogger.error(`response result is empty`)
        return false
    }

    //Check that items contan the expected keys
    for (item of response_data){
        if (! "attendance" && "description" && "start_date" && "end_date" && "impact_analysis"
        && "location_id" && "name" && "event_id" in item){
            generalLogger.error(`response result is missing keys`)
            return false
        }
    }

    generalLogger.info("response result is OK")
    return true
}


/**
 * A function that makes validaton checks on the response data (locations)
 * 
 * Logs the result of each check
 * Returns False if a high priority check fails
 * Returns True otherwise (result is usable)
 * 
 * @param {dictionary} response_data 
 * @returns {boolean} 
 */
const validate_locations = (response_data) => {

    // Check if response contains no data
    if (response_data === null || response_data === undefined || response_data.length == 0){
        generalLogger.error(`response result is empty`)
        return false
    }

    counter = 0
    for (item of response_data){
        if (! item["location_id"] in LOCATIONS.LocKeys)
        counter++
    }

    if (counter > LOCATIONS.LocNumMin){
        generalLogger.info("response is missing too many locations")
        return false
    }

    generalLogger.info("response result is OK")
    return true
}

module.exports = {validate_events, validate_locations}