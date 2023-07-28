import json
from flask import abort
from logging_flask.logger import general_logger
from static.peak_times import peak_times

## CONTROLLERS ##

# HISTORIC/EVENT/IMPACT
def event_impact(eventID):
    general_logger.info(f"impact quried for event: {eventID}")
    eventID = int(eventID)
    impact_filtered = event_filter(load_event_impact(), eventID, peak_times.get(eventID))
    return json.dumps(impact_filtered), 200


# HISTORIC/EVENT/BASELINE
def event_baseline(eventID):
    general_logger.info(f"baseline quried for event: {eventID}")
    eventID = int(eventID)
    baseline_filtered = event_filter(load_event_baseline(), eventID, peak_times.get(eventID))
    return json.dumps(baseline_filtered), 200


# HISTORIC/EVENT/TIMELAPSE
def event_timelapse(eventID):
    general_logger.info(f"event timelapse queried for event: {eventID}")
    eventID = int(eventID)
    impact_filtered = event_filter(load_event_impact(), eventID)
    return json.dumps(impact_filtered), 200


# HISTORIC/EVENT/COMPARE
def event_comparison(eventID):
    general_logger.info(f"Event impact queried for event: {eventID}")
    eventID = int(eventID)

    #Load and Filter event impact & event baseline:
    baseline_filtered = event_filter(load_event_baseline(), eventID)
    impact_filtered = event_filter(load_event_impact(), eventID)

    if baseline_filtered.keys() != impact_filtered.keys():
        raise abort(500, "time key mismatch for filtered baseline and impact")

    # Calculate difference between impact and baseline:
    difference = dict.fromkeys(baseline_filtered.keys())

    for time in baseline_filtered:
        difference[time] = {} # Allows 2D assignment
        for location in baseline_filtered[time]:
            impact_score = impact_filtered[time][location]
            baseline_score = baseline_filtered[time][location]
            difference[time][location] = impact_score - baseline_score

    outputjson = json.dumps(difference)
    return outputjson, 200


## HELPER FUNCTIONS ##

# Load Event Impact JSON from static/
def load_event_impact():
    try:
        file = open("static/impact_events.json")
        general_logger.info("Reading file impact_events.json")
    except IOError as err:
        general_logger.error(f"Unable to read file {err}")
        raise abort(500, "Unable to read file 'impact_events.json'")
    return file 

# Load Event Baseline JSON from static/
def load_event_baseline():
    try:
        file = open("static/baseline_events.json")
        general_logger.info("Reading file baseline_events.json")
    except IOError as err:
        general_logger.error(f"Unable to read file {err}")
        raise abort(500, "Unable to read file 'baseline_events.json'")
    return file 

# Filter file by EventID and Time[optional]
# If Time: Returns dictionary of {hour1: {location1: busyness...}...}
# If Not Time: Returns dictionary of {location1: busness, location2: busyness}
def event_filter(file, id, for_time=None):
    original_json = json.load(file)
    filtered = {}

    try: 
        for item in original_json:
            # Filter by EVENT AND TIME
            if for_time is not None:

                if item["Event_ID"] == id and item["time"] == for_time:
                    location = str(item["location_id"])
                    filtered[location] = item["busyness_score"]

            # Filter by EVENT ONLY 
            if for_time is None:

                if item["Event_ID"] == id:
                    location = str(item["location_id"])
                    time = str(item["time"])

                    if time not in filtered:
                        filtered[time] = {} # Allows 2D assignment next

                    filtered[time][location] = item["busyness_score"]

        return filtered

    except Exception as exc:
        general_logger.error(f"There was an error filtering '{file.name}': {exc}")
        raise abort(500, f"Unable to filter '{file.name}'")

