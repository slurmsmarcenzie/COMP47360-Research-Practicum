import json
from flask import abort
from datetime import datetime
from logging_flask.logger import general_logger

# Get baseline busyness from the model with the datetime specified in URL
# Currently uses static file ".json" to mimic the model
# Return a JSON array of busyness/location scores 
def baseline(date):
    general_logger.info("baseline quried for datetime: {date}".format(date=date))

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
        file = open("static/GENERAL_BASELINE_JUNE.json") #temporary, will use the model lader
    except IOError as err:
        print(err)
        general_logger.error("Unable to read file {error}".format(error=err))
        raise abort(500, "Unable to read file 'GENERAL_BASELINE_JUNE.json'")

    general_logger.info("Reading file GENERAL_BASELINE_JUNE.json")
    return json.load(file), 200

def baseline_event(date, event):
    general_logger.info("baseline quried for datetime: {date}, of event: {event}".format(date=date, event=event))

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
        file = open("static/EVENTS_BASELINE.json") #temporary, will use the model lader
    except IOError as err:
        general_logger.error("Unable to read file {error}".format(error=err))
        raise abort(500, "Unable to read file 'EVENTS_BASELINE.json'")

    general_logger.info("Reading file EVENTS_BASELINE.json")

    #Extract relevant event from EVENTS_IMPACT:
    eventID = int(event)

    try:
        original = json.load(file)
        extracted = []

        for item in original:
            if item["Event_ID"] == eventID:
                extracted.append(item)
        
        outputjson = json.dumps(extracted)
    except Exception as exc:
        general_logger.error("There was an error filtering events baseline {error}".format(error=err))
        raise abort(500, "Unable to filter 'EVENTS_BASELINE.json'")

    return outputjson, 200