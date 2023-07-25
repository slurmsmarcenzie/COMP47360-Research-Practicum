from current_busyness_prediction.predict import general_prediction
import datetime

def event_prediction(eventID):
    #get date of event
    event_date = get_event_date(eventID)
    #Get prediction for date
    date_prediction = general_prediction(event_date)
    #Load eventpredict model
    model = None
    #Give input to model
    result = model.predict(date_prediction)
    #Format result
    result = normalise_and_format(result)
    #Return results 
    return result

def get_event_date(eventID):
    return datetime.datetime.now()

def normalise_and_format(data):
    return data