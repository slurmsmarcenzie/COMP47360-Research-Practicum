import json
from datetime import datetime
from zoneinfo import ZoneInfo
from logging_flask.logger import general_logger
from predicting.current_busyness_prediction.predict import general_prediction

# Get baseline busyness from the model with the datetime specified in URL
# Return a JSON array of busyness/location scores 
def current():
   
    datetimeNY = datetime.now(tz=ZoneInfo("America/New_York"))
    general_logger.info("prediction quried for datetime: {date}".format(date=datetimeNY))

    #TODO - Implement try catch later
    data = general_prediction(datetimeNY)
    general_logger.info("calling model for current busyness")
    return json.dumps(data), 200