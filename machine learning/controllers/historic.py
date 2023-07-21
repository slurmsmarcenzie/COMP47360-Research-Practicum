import json
from flask import abort
from logging_flask.logger import general_logger

def event_impact(event):
    general_logger.info("event impact quried for event: {event}".format(event=event))

    try:
        file = open("static/impact_events.json")
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

def event_baseline(event):
    general_logger.info("event baseline quried for event: {event}".format(devent=event))

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
            if item["Event_ID"] == eventID and item["time"] == 18:
                extracted.append(item)
        
        outputjson = json.dumps(extracted)
    except Exception as exc:
        general_logger.error("There was an error filtering events baseline {error}".format(error=exc))
        raise abort(500, "Unable to filter 'baseline_events.json'")

    return outputjson, 200