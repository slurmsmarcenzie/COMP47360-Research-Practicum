import pickle
import pandas as pd
from flask import abort
from logging_flask.logger import general_logger
from predicting.current_busyness_prediction.data import col_names, location_ids
from custom_exceptions.model_error import ModelError

# Passes input to the chosen model
# returns a list of location:busyness pairs
def general_prediction(date):
    try:
        pickled_model = pickle.load(open('predicting/models/xgb_non_normalised_merged_model.pkl', 'rb'))
        general_logger.info("Successfully loaded pickled model")
    except pickle.PickleError as err:
        raise ModelError("Error loading pickled model: {err}".format(err=err))
    
    try:
        data = []
        input_data = generate_model_input(date)
        general_logger.info("Successfully generated model input")
    except Exception as exc:
        raise ModelError("Problem generating model input: {exc}".format(exc=exc))

    # Create a row of input for each individual location
    # Create a dataframe from rows and pass to the model
    try:
        for loc in location_ids:
            input_data["DOLocationID"] = loc
            df = pd.DataFrame(input_data, index=[0])
            score = pickled_model.predict(df)
            data.append({"location_id":loc, "busyness_score":score[0]})
    except Exception as exc:
        raise ModelError("Could not generate model results: {exc}".format(exc=exc))
    
    # Normalise the busyness scores so they are relative to eachother and in the range 0-1
    try:
        normalised_data = normalise_and_format(data) 
        general_logger.info("Normalising model results")
    except Exception as exc:
        raise ModelError("Problem normalising model results: {exc}".format(exc=exc))
    
    return normalised_data

# Parses the date to suit our models input
# Returns a dictionary of features and their values
def generate_model_input(date):
    hour = date.hour
    dayOfMonth = date.day
    month = date.month
    day = date.isoweekday()
    weekend = 1 if day > 5 else 0 
    
    # Dictionary of features & their values
    input_data = dict.fromkeys(col_names, 0)
    input_data.update({"Hour": hour, "DayOfMonth": dayOfMonth, "Month": month, "Weekend": weekend})

    # Set the relevant day of week to 1 (i.e. True)
    match day:
        case 1:
            input_data["DayOfWeek_0"] = 1
        case 2:
            input_data["DayOfWeek_1"] = 1
        case 3:
            input_data["DayOfWeek_2"] = 1
        case 4: 
            input_data["DayOfWeek_3"] = 1
        case 5:
            input_data["DayOfWeek_4"] = 1
        case 6:
            input_data["DayOfWeek_5"] = 1
        case 7:
            input_data["DayOfWeek_6"] = 1

    # Set the relevant time of day to 1 (i.e. True)
    if hour >= 0 and hour < 6:
        input_data["TimeOfDay_Night"] = 1
    elif hour < 12:
        input_data["TimeOfDay_Morning"] = 1
    elif hour < 17:
        input_data["TimeOfDay_Afternoon"] = 1
    elif hour < 22:
        input_data["TimeOfDay_Evening"] = 1
    elif hour < 24:
        input_data["TimeOfDay_Night"] = 1

    return input_data

# Normalises the busyness scores to a value between 0 and 1.
# Returns the normalised data (now ready for client)
def normalise_and_format(data):
    #get min and max for normalisation formula:
    min, max = 0, 0
    for item in data:
        if item["busyness_score"] < min:
            min = item["busyness_score"]
        elif item["busyness_score"] > max:
            max = item["busyness_score"]

    # Normalise and format:
    # busyness score is stringified to better suit JSON later
    for item in data:
        item["busyness_score"] = str((item["busyness_score"] - min) / (max - min))

    return data
    
