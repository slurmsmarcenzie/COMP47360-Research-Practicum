import json
from flask import abort
from datetime import datetime
from zoneinfo import ZoneInfo
from logging_flask.logger import general_logger
from predicting.current_busyness_prediction.predict import general_prediction

# Get baseline busyness from the model with the datetime specified in URL
# Return a JSON array of busyness/location scores 
def baseline():
    datetimeNY = datetime.now(tz=ZoneInfo("America/New_York"))
    general_logger.info("baseline quried for datetime: {date}".format(date=datetimeNY))

    #Implement try catch later
    data = general_prediction(datetimeNY)
    general_logger.info("calling model for current busyness")
    return json.dumps(data), 200

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
        file = open("static/baseline_events.json") #temporary, will use the model lader
    except IOError as err:
        general_logger.error("Unable to read file {error}".format(error=err))
        raise abort(500, "Unable to read file 'baseline_events.json'")

    general_logger.info("Reading file baseline_events.json")

    #Extract relevant event from baseline_events:
    eventID = int(event)

    try:
        original = json.load(file)
        extracted = []

        for item in original:
            if item["Event_ID"] == eventID and item["time"] == 12:
                extracted.append(item)
        
        outputjson = json.dumps(extracted)
    except Exception as exc:
        general_logger.error("There was an error filtering events baseline {error}".format(error=exc))
        raise abort(500, "Unable to filter 'baseline_events.json'")

    return outputjson, 200