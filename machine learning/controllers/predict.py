import json
from flask import abort
import datetime
from zoneinfo import ZoneInfo
from logging_flask.logger import general_logger
from predicting.current_busyness_prediction.predict import general_prediction
from extensions.cache_ext import cache


def secs_left():
    """
    Determines the number of seconds left until next hour.
    This is necessary to timeout cache every hour.
    
    Every hour of the day will have new prediction results. So the cached predictions must be removed

    Input: None
    Returns: Integer (seconds left)
    """
    now = datetime.datetime.now()
    delta = datetime.timedelta(hours=1)
    next = (now + delta).replace(microsecond=0, second=0, minute=0)
    return (next - now).seconds


@cache.cached(timeout=secs_left(), key_prefix="current")
def current():
    """
    Calls the model with the current datetime to get baseline predictions for NOW.

    Input: None
    Returns: JSON of busyness/location scores 
    """

    datetimeNY = datetime.datetime.now(tz=ZoneInfo("America/New_York"))
    general_logger.info("prediction quried for datetime: {date}".format(date=datetimeNY))

    try:
        data = general_prediction(datetimeNY)
        general_logger.info("calling model for current busyness")
    except Exception as exc:
        general_logger.error("Error getting predictions from model: {exc}".format(exc=exc))
        raise abort(500, "Error getting model predictions")
    
    return json.dumps(data), 200