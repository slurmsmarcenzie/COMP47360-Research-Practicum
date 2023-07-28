import json
from flask import abort
import datetime
from zoneinfo import ZoneInfo
from logging_flask.logger import general_logger
from predicting.current_busyness_prediction.predict import general_prediction
from extensions.cache_ext import cache


# Determines the number of seconds left until nect hour
# This is necessary to timeout cache for each hour (new prediction results)
def secs_left():
    now = datetime.datetime.now()
    delta = datetime.timedelta(hours=1)
    next = (now + delta).replace(microsecond=0, second=0, minute=0)
    return (next - now).seconds


# Get baseline busyness from the model with the datetime specified in URL
# Return a JSON array of busyness/location scores 
@cache.cached(timeout=secs_left(), key_prefix="current")
def current():
    datetimeNY = datetime.datetime.now(tz=ZoneInfo("America/New_York"))
    general_logger.info("prediction quried for datetime: {date}".format(date=datetimeNY))

    try:
        data = general_prediction(datetimeNY)
        general_logger.info("calling model for current busyness")
    except Exception as exc:
        general_logger.error("Error getting predictions from model: {exc}".format(exc=exc))
        raise abort(500, "Error getting model predictions")
    
    return json.dumps(data), 200