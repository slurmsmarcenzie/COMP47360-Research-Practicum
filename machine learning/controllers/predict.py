import json
from flask import abort
from datetime import datetime
from zoneinfo import ZoneInfo
from logging_flask.logger import general_logger
from predicting.current_busyness_prediction.predict import general_prediction
from predicting.event_busyness_prediction.predict import event_prediction

# Get baseline busyness from the model with the datetime specified in URL
# Return a JSON array of busyness/location scores 
def current():
   
    datetimeNY = datetime.now(tz=ZoneInfo("America/New_York"))
    general_logger.info("prediction quried for datetime: {date}".format(date=datetimeNY))

    try:
        data = general_prediction(datetimeNY)
        general_logger.info("calling model for current busyness")
    except Exception as exc:
        general_logger.error("Error getting predictions from model: {exc}".format(exc=exc))
        raise abort(500, "Error getting model predictions")
    
    return json.dumps(data), 200


def event(eventID):

    try:
        data = event_prediction(eventID)
        general_logger.info("calling model for event busyness")
    except Exception as exc:
        general_logger.error("Error getting predictions from model: {exc}".format(exc=exc))
        raise abort(500, "Error getting model predictions")
    
    return json.dumps(data), 200