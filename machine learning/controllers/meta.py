from models.event import Event
from models.metric import Metric
from sqlalchemy import exc
from flask import abort

# Query Database and get a list of Event dictionaries
# "_sa_instance_state" is removed as only field names are needed
def list_events():
    events = []
    data = []

    # Handle Database Error:
    try:
        events = Event.query.all()
    except exc.SQLAlchemyError as er:
        print(er)
        #TODO - add to log
        raise abort(500, "There was an error retrieving events from the Database")
    
    # Ensure data is in correct format
    if len(events) > 0:  
        for event in events:
            if not isinstance(event, Event):
                continue
            if "_sa_instance_state" in event.__dict__:
                event.__dict__.pop("_sa_instance_state")
            data.append(event.__dict__)


    return data

# Query Database and get a list of Metric dictionaries
# "_sa_instance_state" is removed as only field names are needed
def list_metrics():
    metrics = []
    data = []

    # Handle Database error:
    try:
        metrics = Metric.query.all()
    except exc.SQLAlchemyError as er:
        print(er)
        #TODO - add to log
        raise abort(500, "There was an error retrieving metrics from the Database")

    # Ensure data is in correct format:
    if len(metrics) > 0:    
        for metric in metrics:
            if not isinstance(metric, Metric):
                continue
            if "_sa_instance_state" in metric.__dict__:
                metric.__dict__.pop("_sa_instance_state")
            data.append(metric.__dict__)
    return data

    
    