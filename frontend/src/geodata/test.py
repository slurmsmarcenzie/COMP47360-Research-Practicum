import json
import statistics

def generate_array(eventID, start, end):
    file = open("impact_events.json")
    original = json.load(file)

    # Initialize list of dictionaries
    filtered = []
    for _ in range(start, end):
        filtered.append({})

    print(filtered)
    print(len(filtered))

    for item in original:
        if item["Event_ID"] == eventID and start <= item['time'] < end:
            # Directly add the location_id: busyness_score pair to the group corresponding to the time
            filtered[item['time'] - start][item['location_id']] = item['busyness_score']

    return filtered

def get_max_chart_data_baseline(eventID):

    with open("baseline_events.json") as file:
        original = json.load(file)

    # initialize a dictionary with hours as keys and -1 as initial max values
    max_busyness_score = {hour: -1 for hour in range(24)}
    
    zones = [48, 236, 170, 237, 79, 142, 230, 186, 161]

    for item in original:
        if item['Event_ID'] == eventID:
            time = item.get('time')
            busyness_score = item.get('busyness_score')
            location_id = item.get('location_id')
            if time is not None and busyness_score is not None and location_id in zones:
                # check if the current busyness_score is more than the current max
                if busyness_score > max_busyness_score[time]:
                    max_busyness_score[time] = busyness_score

    return max_busyness_score


def get_max_chart_data_impact(eventID):

    with open("impact_events.json") as file:
        original = json.load(file)

    # initialize a dictionary with hours as keys and -1 as initial max values
    max_busyness_score = {hour: -1 for hour in range(24)}
    
    zones = [48, 236, 170, 237, 79, 142, 230, 186, 161]

    for item in original:
        if item['Event_ID'] == eventID:
            time = item.get('time')
            busyness_score = item.get('busyness_score')
            location_id = item.get('location_id')
            if time is not None and busyness_score is not None and location_id in zones:
                # check if the current busyness_score is more than the current max
                if busyness_score > max_busyness_score[time]:
                    max_busyness_score[time] = busyness_score

    return max_busyness_score

def get_med_chart_data_impact(eventID):

    with open("impact_events.json") as file:
        original = json.load(file)

    # initialize a dictionary with hours as keys and empty lists as values
    busyness_scores = {hour: [] for hour in range(24)}

    zones = [48, 236, 170, 237, 79, 142, 230, 186, 161]

    for item in original:
        if item['Event_ID'] == eventID:
            time = item.get('time')
            busyness_score = item.get('busyness_score')
            location_id = item.get('location_id')
            if time is not None and busyness_score is not None and location_id in zones:
                # add the busyness score to the list for the hour
                busyness_scores[time].append(busyness_score)

    # calculate the median busyness score for each hour, flattening the scores to 2 decimal places
    median_busyness_score = {hour: round(statistics.median(scores), 2) if scores else 0 
                             for hour, scores in busyness_scores.items()}

    return median_busyness_score

def get_med_chart_data_baseline(eventID):

    with open("baseline_events.json") as file:
        original = json.load(file)

    # initialize a dictionary with hours as keys and empty lists as values
    busyness_scores = {hour: [] for hour in range(24)}

    zones = [48, 236, 170, 237, 79, 142, 230, 186, 161]

    for item in original:
        if item['Event_ID'] == eventID:
            time = item.get('time')
            busyness_score = item.get('busyness_score')
            location_id = item.get('location_id')
            if time is not None and busyness_score is not None and location_id in zones:
                # add the busyness score to the list for the hour
                busyness_scores[time].append(busyness_score)

    # calculate the median busyness score for each hour, flattening the scores to 2 decimal places
    median_busyness_score = {hour: round(statistics.median(scores), 2) if scores else 0 
                             for hour, scores in busyness_scores.items()}

    return median_busyness_score


def event_comparison(eventID):
    
    # general_logger.info(f"Event impact queried for event: {eventID}")

    try:
        baseline_file = open("baseline_events.json")
        baseline_data = json.load(baseline_file)
        # general_logger.info("Successfully read file baseline_events.json for comparison")

        impact_file = open("impact_events.json")
        impact_data = json.load(impact_file)
        # general_logger.info("Successfully read file impacts_events.json for comparison")
    
    except IOError as err:
        # general_logger.error(f"Unable to read file: {err}")
        raise

    try:
        baseline_filtered = [entry for entry in baseline_data if entry.get("Event_ID") == eventID]
        current_filtered = [entry for entry in impact_data if entry.get("Event_ID") == eventID]

        baseline_dict = {}
        impact_dict = {}

        for entry in baseline_filtered:
            time = entry.get("time")
            location_id = entry.get("location_id")
            busyness_score = entry.get("busyness_score")
            if time and location_id and busyness_score:
                if time not in baseline_dict:
                    baseline_dict[time] = {}
                baseline_dict[time][location_id] = busyness_score

        for entry in current_filtered:
            time = entry.get("time")
            location_id = entry.get("location_id")
            busyness_score = entry.get("busyness_score")
            if time and location_id and busyness_score:
                if time not in impact_dict:
                    impact_dict[time] = {}
                impact_dict[time][location_id] = busyness_score

        result = []

        for time in sorted(set(baseline_dict.keys()) | set(impact_dict.keys())):
            busyness_entry = {"Time": time, "busyness": {}}
            for location_id in set(baseline_dict.get(time, {}).keys()) | set(impact_dict.get(time, {}).keys()):
                baseline_score = baseline_dict.get(time, {}).get(location_id, 0.0)
                current_score = impact_dict.get(time, {}).get(location_id, 0.0)
                difference = current_score - baseline_score
                busyness_entry["busyness"][location_id] = difference
            result.append(busyness_entry)
        
        # general_logger.info(f"Result data: {result}")
        return result, 200
    
    except KeyError as err:
        # general_logger.error(f"Key Error occurred: {err}")
        raise
    except Exception as e:
        # general_logger.error(f"An unexpected error occurred: {e}")
        raise

x = event_comparison(1)

print(x)