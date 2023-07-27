from predicting.current_busyness_prediction.predict import general_prediction
from logging_flask.logger import general_logger
from custom_exceptions.model_error import ModelError
import datetime
import pickle

def event_prediction(eventID):
    event_date = get_event_date(eventID)
    pickled_model = pickle.load(open('predicting/models/EventPrediction.pkl', 'rb'))
    #general_prediction(event_date)
    #print("date_predictions", date_predictions)
    # try:
    #     pickled_model = pickle.load(open('predicting/models/EventPrediction.pkl', 'rb'))
    #     general_logger.info("Successfully loaded pickled model")
    # except pickle.PickleError as err:
    #     raise ModelError("Error loading pickled model: {err}".format(err=err))
    
    # #Give input to model
    # result = pickled_model.predict(date_predictions)
    # #Format result
    # result = normalise_and_format(result)
    # #Return results 
    return "hello"

def get_event_date(eventID):
    return datetime.datetime.now()

def normalise_and_format(data):
    return data