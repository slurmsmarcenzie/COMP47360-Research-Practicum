from models.event import Event
from sqlalchemy import exc
from flask import abort

# Query Database and get a list of Event dictionaries
# "_sa_instance_state" is removed as only field names are needed
def list_events():
    events = []
    data = []

    try:
        events = Event.query.all()
    except exc.SQLAlchemyError as er:
        print(er)
        #TODO - add to log
        raise abort(500, "There was an error retrieving events from the Database")
    
    if len(events) > 0:  
        for event in events:
            if not isinstance(event, Event):
                continue
            if "_sa_instance_state" in event.__dict__:
                event.__dict__.pop("_sa_instance_state")
            data.append(event.__dict__)

    return data
    
    