import pickle
import json
import pandas as pd
from logging_flask.logger import general_logger
from predicting.data import col_names_general, location_ids
from custom_exceptions.model_error import ModelError
from time import sleep

# Passes input to the chosen model
# Choice of returning normalised or non-normalised data
# returns a dictionary of location:busyness pairs
def general_prediction(date, normalise=True):
    try:
        pickled_model = pickle.load(open('predicting/models/xgb_final.pkl', 'rb'))
        general_logger.info("Successfully loaded pickled model")
    except pickle.PickleError as err:
        raise ModelError("Error loading pickled model: {err}".format(err=err))
    
    try:
        data = {}
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
            data[str(loc)] = float(score[0]) #numpy float32 incompatible with JSON
            
    except Exception as exc:
        raise ModelError("Could not generate model results: {exc}".format(exc=exc))
    
    if normalise:
    # Normalise the busyness scores so they are relative to eachother and in the range 0-1
        try:
            normalised_data = normalise_data(data) 
            general_logger.info("Normalising model results")
        except Exception as exc:
            raise ModelError("Problem normalising model results: {exc}".format(exc=exc))
        
        return normalised_data
    
    if not normalise:
        return json.dumps(data)
            

# Parses the date to suit our models input
# Returns a dictionary of features and their values
def generate_model_input(date):
    hour = date.hour
    dayOfMonth = date.day
    month = date.month
    day = date.isoweekday()
    weekend = 1 if day > 5 else 0 
    
    # Dictionary of features & their values
    input_data = dict.fromkeys(col_names_general, 0)
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
def normalise_data(data):
    #get min and max for normalisation formula:
    min, max = 0, 0
    for key in data:
        if data[key] < min:
            min = data[key]
        elif data[key] > max:
            max = data[key]

    # Normalise and format:
    # busyness score is stringified to better suit JSON later
    for key in data:
        data[key] = (data[key] - min) / (max - min)

    return data
    
