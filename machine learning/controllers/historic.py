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

    peak_times = [15, 13, 19, 0, 19, 13, 19, 22]
    position = eventID - 1
    peak = peak_times[position]

    try:
        original = json.load(file)
        filtered = []

        for item in original:
            if item["Event_ID"] == eventID and item["time"] == peak:
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

    peak_times = [15, 13, 19, 0, 19, 13, 19, 22]
    position = eventID - 1
    peak = peak_times[position]

    try:
        original = json.load(file)
        filtered = []

        for item in original:
            if item["Event_ID"] == eventID and item["time"] == peak:
                filtered.append(item)
        
        outputjson = json.dumps(filtered)
        
    except Exception as exc:
        general_logger.error("There was an error filtering events baseline {error}".format(error=exc))
        raise abort(500, "Unable to filter 'baseline_events.json'")

    return outputjson, 200

def event_comparison(eventID):
    
    general_logger.info(f"Event impact queried for event: {eventID}")

    #Extract relevant event from impact_events:
    eventID = int(eventID)

    # Open our files and log status accordingly
    try:
        baseline_file = open("static/baseline_events.json")
        baseline_data = json.load(baseline_file)
        general_logger.info("Successfully read file baseline_events.json for comparison")

        impact_file = open("static/impact_events.json")
        impact_data = json.load(impact_file)
        general_logger.info("Successfully read file impacts_events.json for comparison")
    
    except IOError as err:
        general_logger.error(f"Unable to read file: {err}")
        raise

    general_logger.info(f"Number of entries in baseline_data: {len(baseline_data)}")
    general_logger.info(f"Number of entries in impact_data: {len(impact_data)}")

    # filter our files by the event id we extracted above and set this to an array
    try:
        baseline_filtered = [entry for entry in baseline_data if entry.get("Event_ID") == eventID]
        impact_filtered = [entry for entry in impact_data if entry.get("Event_ID") == eventID]

        general_logger.info(f"Number of entries after filtering baseline_data: {len(baseline_filtered)}")
        general_logger.info(f"Number of entries after filtering impact_data: {len(impact_filtered)}")

        baseline_dict = {}
        impact_dict = {}

        # for every hour create an internal dictionary with the busyness scores related to each location
        # do this for both impact and baseline dictionaries

        for entry in baseline_filtered:
            time = entry.get("time")
            location_id = entry.get("location_id")
            busyness_score = entry.get("busyness_score")
            if time is not None and location_id is not None and busyness_score is not None:
                if time not in baseline_dict:
                    baseline_dict[time] = {}
                baseline_dict[time][location_id] = busyness_score

        for entry in impact_filtered:
            time = entry.get("time")
            location_id = entry.get("location_id")
            busyness_score = entry.get("busyness_score")
            if time is not None and location_id is not None and busyness_score is not None:
                if time not in impact_dict:
                    impact_dict[time] = {}
                impact_dict[time][location_id] = busyness_score

        general_logger.info(f"Number of entries in baseline_dict: {baseline_dict}")
        general_logger.info(f"Number of entries in impact_dict: {impact_dict}")

        general_logger.info(f"Unique time values in baseline_dict: {set(baseline_dict.keys())}")
        general_logger.info(f"Unique time values in impact_dict: {set(impact_dict.keys())}")

        result = []

        # create a difference hashmap to show the relative rates of change between the two positions for each hour of the day
        for time in sorted(set(baseline_dict.keys()) | set(impact_dict.keys())):
            busyness_entry = {"Time": time, "busyness": {}}
            for location_id in set(baseline_dict.get(time, {}).keys()) | set(impact_dict.get(time, {}).keys()):
                baseline_score = baseline_dict.get(time, {}).get(location_id, 0.0)
                current_score = impact_dict.get(time, {}).get(location_id, 0.0)
                difference = current_score - baseline_score
                busyness_entry["busyness"][location_id] = difference
            result.append(busyness_entry)
        
        general_logger.info(f"Result data: {result}")
    
    except KeyError as err:
        general_logger.error(f"Key Error occurred: {err}")
        raise
    except Exception as e:
        general_logger.error(f"An unexpected error occurred: {e}")
        raise

    outputjson = json.dumps(result)

    return outputjson, 200
