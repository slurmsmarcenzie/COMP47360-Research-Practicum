import json
from flask import abort
from datetime import datetime

# Get a prediction from the model with the datetime specified in URL
# Currently uses static file "output.json" to mimic the model
# Return a JSON array of busyness/location scores 
def prediction(date):
    print("prediction quried for datetime:", date)
    #TODO - add to log

    # Prevent invalid datetime:
    try:
        datetime.fromisoformat(date)
    except ValueError as err:
        print(err)
        #TODO - add to log
        raise abort(500, "Incorrect date format supplied, should be YYYY-MM-DD")

    # Handle file read error (later this will be handle model failure):
    try:
        file = open("static/output.json") #temporary, will use the model lader
    except IOError as err:
        print(err)
        #TODO - add to log
        raise abort(500, "Unable to read file 'output.json'")

    data = json.load(file)

    # Ensure that the prediction list has the correct format:
    valid = False
    for index, item in enumerate(data):
        if "location_id" and "busyness_score" in item:
            valid = True # at least 1 index has correct values
        else:
            print("warning: prediction list contains incorrectly formatted values at index %s" % index)
            #TODO - add to log
        
    if valid:
        return data 
    else:
        raise abort(500, "Invalid prediction list created")