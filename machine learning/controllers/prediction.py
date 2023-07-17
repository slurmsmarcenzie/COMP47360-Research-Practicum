import json
from flask import abort
from datetime import datetime
from logging_flask.logger import general_logger, http_logger

# Get a prediction from the model with the datetime specified in URL
# Currently uses static file "MOCK_DATA.json" to mimic the model
# Return a JSON array of busyness/location scores 

#UPDATE: We need this controller to get a list of specific events impact from "EVENTS_IMPACT"
#

def prediction(date, event):
    general_logger.info("prediction quried for datetime: {date}, of event: {event}".format(date=date, event=event))

    # Prevent invalid datetime:
    try:
        # cannot use below format as it includes milliseconds
        # datetime.fromisoformat(date)
        # must use below to stop after seconds
        datetime.strptime(date, "%Y-%m-%dT%H:%M:%S.%fZ")
    except ValueError as err:
        general_logger.error("Incorrect date format: {error}".format(error=err))
        raise abort(500, "Incorrect date format supplied, should be YYYY-MM-DD")

    # Handle file read error (later this will be handle model failure):
    try:
        file = open("static/impact_events.json") #temporary, will use the model lader
    except IOError as err:
        general_logger.error("Unable to read file {error}".format(error=err))
        raise abort(500, "Unable to read file 'impact_events.json'")

    general_logger.info("Reading file impact_events.json")

    #Extract relevant event from impact_events:
    eventID = int(event)

    try:
        original = json.load(file)
        extracted = []

        for item in original:
            if item["Event_ID"] == eventID and item["time"] == 18:
                extracted.append(item)
        
        outputjson = json.dumps(extracted)
    except Exception as exc:
        general_logger.error("There was an error filtering events impact {error}".format(error=exc))
        raise abort(500, "Unable to filter 'impact_events.json'")

    return outputjson, 200


    # Below will be left to users of the api
    # Flask API does not need to handle formatting here as output format of model 
    # may change. Applications that request a prediction should handle the reponse 
    # as they see fit

    # # Example:
    # # Ensure that the prediction list has the correct format: # #
    #   valid = False
    #   for index, item in enumerate(data):
    #     if "location_id" and "busyness_score" in item:
    #         valid = True # at least 1 index has correct values
    #     else:
    #         print("warning: prediction list contains incorrectly formatted values at index %s" % index)
    #    
    # if valid:
    #     return data 
    # else:
    #     raise abort(500, "Invalid prediction list created")
