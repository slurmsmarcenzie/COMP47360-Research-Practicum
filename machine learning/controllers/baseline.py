import json
from flask import abort
from datetime import datetime
from logging_flask.logger import general_logger

# Get baseline busyness from the model with the datetime specified in URL
# Currently uses static file ".json" to mimic the model
# Return a JSON array of busyness/location scores 
def baseline(date):
    general_logger.info("baseline quried for datetime: {date}".format(date=date))

    # Prevent invalid datetime:
    try:
        datetime.fromisoformat(date)
    except ValueError as err:
        general_logger.error("Incorrect date format: {error}".format(error=err))
        raise abort(500, "Incorrect date format supplied, should be YYYY-MM-DD")

    # Handle file read error (later this will be handle model failure):
    try:
        file = open("static/MOCK_BASELINE.json") #temporary, will use the model lader
    except IOError as err:
        print(err)
        general_logger.error("Unable to read file {error}".format(error=err))
        raise abort(500, "Unable to read file 'MOCK_BASELINE.json'")

    general_logger.info("Reading file MOCK_BASELINE.json")
    return json.load(file), 200