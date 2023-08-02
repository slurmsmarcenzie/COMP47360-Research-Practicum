import json
from enum import Enum
from flask import abort
from logging_flask.logger import general_logger
from predicting.data import peak_times
from extensions.cache_ext import cache
from models.busyness import Busyness
from sqlalchemy import exc


class Metric(Enum):
    """ Enumeration for Busyness Metrics """
    BASELINE = 0
    IMPACT = 1
    TIMELAPSE = 2
    COMPARISON = 3


## CONTROLLERS ##

@cache.memoize(timeout=0)
def event_impact(eventID):
    """
    Controller for: HISTORIC/EVENT/IMPACT\n
    Returns event impact (filtered by peak time)
    """
    general_logger.info(f"impact quried for event: {eventID}")
    time = peak_times.get(eventID)
    impact_filtered = query_database(eventID, Metric.IMPACT, time=time)
    return impact_filtered, 200


@cache.memoize(timeout=0)
def event_baseline(eventID):
    """
    Controller for: HISTORIC/EVENT/BASELINE\n
    Returns event baseline (filtered by peak time)
    """
    general_logger.info(f"baseline quried for event: {eventID}")
    time = peak_times.get(eventID)
    baseline_filtered = query_database(eventID, Metric.BASELINE, time=time)
    return baseline_filtered, 200


@cache.memoize(timeout=0)
def event_timelapse(eventID):
    """
    Controller for: HISTORIC/EVENT/TIMELAPSE\n
    Returns event timelaspse for 24hr period
    """
    general_logger.info(f"event timelapse queried for event: {eventID}")
    timelapse_filtered = query_database(eventID, Metric.TIMELAPSE)
    return timelapse_filtered, 200


@cache.memoize(timeout=0)
def event_comparison(eventID):
    """
    Controller for: HISTORIC/EVENT/COMPARISON\n
    Returns event comparison for 24hr period
    """
    general_logger.info(f"event comparison queried for event: {eventID}")
    comparison_filtered = query_database(eventID, Metric.COMPARISON)
    return comparison_filtered, 200



## HELPER FUNCTIONS ##

def query_database(eventID, metric, time=None):
    """
    Queries historic busyness scores from the Database\n
    Filters scores for the specified metric and time
    """
    
    result = {}

    try:
        if metric == Metric.BASELINE:
            # filter for baseline and peak hour
            busyness = Busyness.query.filter_by(event_id=eventID, time_hour=time).all()
            for item in busyness:
                result[str(item.location_id)] = item.baseline

        if metric == Metric.IMPACT:
            # filter for impact and peak hour
            busyness = Busyness.query.filter_by(event_id=eventID, time_hour=time).all()
            for item in busyness:
                result[str(item.location_id)] = item.impact

        if metric == Metric.COMPARISON:
            # filter for difference and full day
            for hour in range(23):
                busyness = Busyness.query.filter_by(event_id=eventID, time_hour=hour).all()
                result[str(hour)] = {}
                for item in busyness:
                    result[str(hour)][str(item.location_id)] = item.impact 

        if metric == Metric.TIMELAPSE:
            # filter for impact and full day
            for hour in range(23):
                busyness = Busyness.query.filter_by(event_id=eventID, time_hour=hour).all()
                result[str(hour)] = {}
                for item in busyness:
                    result[str(hour)][str(item.location_id)] = item.difference

    except exc.SQLAlchemyError as er:
        general_logger.error("Issue retreiving from database: {error}".format(error=er.orig))
        raise abort(500, "There was an error retrieving busyness from the Database")
       
    return result


## BELOW CODE IS FOR USING THE API WITH STATIC FILES RATHER THAN SQLITE DB ##
## NOTE: The calls to query_database in controllers should be swapped with
## load_file and event_filter                            
    

# def load_file(file_str):
#     """ Loads Historic Event JSON from static/ """
#     try:
#         file = open(file_str)
#         general_logger.info(f"Reading file '{file_str}'")
#     except IOError as err:
#         general_logger.error(f"Unable to read file {err}")
#         raise abort(500, f"Unable to read file '{file_str}'")
#     return file 


# def event_comparison_manual(eventID):
#     """
#     Controller for: HISTORIC/EVENT/COMPARISON\n
#     Returns difference between event impact and baseline for 24hr period
#     """
#     general_logger.info(f"event timelapse queried for event: {eventID}")
#     eventID = int(eventID)
    
#      #Load and Filter event impact & event baseline:
#     baseline_filtered = event_filter(load_file("static/PredictedBaseline.json"), eventID)
#     impact_filtered = event_filter(load_file("static/PredictedImpact.json"), eventID)

#     if baseline_filtered.keys() != impact_filtered.keys():
#         raise abort(500, "time key mismatch for filtered baseline and impact")
    
#     difference = dict.fromkeys(baseline_filtered.keys())
    
#     for time in baseline_filtered:
#         difference[time] = {}
#         for location in baseline_filtered[time]:
#             impact_score = impact_filtered[time][location]
#             baseline_score = baseline_filtered[time][location]
#             difference[time][location] = impact_score - baseline_score

#     return difference, 200


# def event_filter(file, id, for_time=None):
#     """
#     Filter file by EventID and Time[optional]

#     If Not Time: Returns dictionary of {location1: busness, location2: busyness}\n
#     If Time: Returns dictionary of {hour1: {location1: busyness...}...}
#     """
    
#     id = int(id)
#     original_json = json.load(file)
#     filtered = {}

#     try: 
#         for item in original_json:
#             # Filter by EVENT AND TIME
#             if for_time is not None:

#                 if item["Event_ID"] == id and item["time"] == for_time:
#                     location = str(item["location_id"])
#                     filtered[location] = item["busyness_score"]

#             # Filter by EVENT ONLY 
#             if for_time is None:

#                 if item["Event_ID"] == id:
#                     location = str(item["location_id"])
#                     time = str(item["time"])

#                     if time not in filtered:
#                         filtered[time] = {} # Allows 2D assignment next

#                     filtered[time][location] = item["busyness_score"]

#         return filtered

#     except Exception as exc:
#         general_logger.error(f"There was an error filtering '{file.name}': {exc}")
#         raise abort(500, f"Unable to filter '{file.name}'")

