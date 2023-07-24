import json
from flask import abort
from logging_flask.logger import general_logger

def event_impact(eventID):
    general_logger.info("event impact quried for event: {event}".format(event=eventID))

    try:
        file = open("static/impact_events.json")
        general_logger.info("Reading file impact_events.json")
    except IOError as err:
        general_logger.error("Unable to read file {error}".format(error=err))
        raise abort(500, "Unable to read file 'impact_events.json'")

    #Extract relevant event from impact_events:
    eventID = int(eventID)

    try:
        original = json.load(file)
        filtered = []

        for item in original:
            if item["Event_ID"] == eventID and item["time"] == 18:
                filtered.append(item)
        
        outputjson = json.dumps(filtered)

    except Exception as exc:
        general_logger.error("There was an error filtering events impact {error}".format(error=exc))
        raise abort(500, "Unable to filter 'impact_events.json'")

    return outputjson, 200

def event_baseline(eventID):
    general_logger.info("event baseline quried for event: {event}".format(event=eventID))

    try:
        file = open("static/baseline_events.json")
        general_logger.info("Reading file baseline_events.json")
    except IOError as err:
        general_logger.error("Unable to read file {error}".format(error=err))
        raise abort(500, "Unable to read file 'baseline_events.json'")

    #Extract relevant event from baseline_events:
    eventID = int(eventID)

    try:
        original = json.load(file)
        filtered = []

        for item in original:
            if item["Event_ID"] == eventID and item["time"] == 18:
                filtered.append(item)
        
        outputjson = json.dumps(filtered)
        
    except Exception as exc:
        general_logger.error("There was an error filtering events baseline {error}".format(error=exc))
        raise abort(500, "Unable to filter 'baseline_events.json'")

    return outputjson, 200