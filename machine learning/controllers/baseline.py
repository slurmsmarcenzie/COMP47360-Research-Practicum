import json
from flask import abort
from datetime import datetime

# Get baseline busyness from the model with the datetime specified in URL
# Currently uses static file ".json" to mimic the model
# Return a JSON array of busyness/location scores 
def baseline(date):
    print("prediction quried for datetime:", date)
    #TODO - add to log

    # Prevent invalid datetime:
    try:
        # cannot use below format as it includes milliseconds
        # datetime.fromisoformat(date)
        # must use below to stop after seconds
        datetime.strptime(date, "%Y-%m-%dT%H:%M:%S.%fZ")
    except ValueError as err:
        print(err)
        #TODO - add to log
        raise abort(500, "Incorrect date format supplied, should be YYYY-MM-DD")

    # Handle file read error (later this will be handle model failure):
    try:
        file = open("static/BASELINE_JUNE.json") #temporary, will use the model lader
    except IOError as err:
        print(err)
        #TODO - add to log
        raise abort(500, "Unable to read file 'MOCK_BASELINE.json'")

    return json.load(file)