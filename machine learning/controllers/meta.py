from models.event import Event
from sqlalchemy import exc
from flask import abort
from logging_flask.logger import general_logger

# Query Database and get a list of Event dictionaries
# "_sa_instance_state" is removed as only field names are needed
def list_events():
    events = []
    data = []

    # Handle Database Error:
    try:
        events = Event.query.all()
    except exc.SQLAlchemyError as er:
        general_logger.error("Issue retreiving from database: {error}".format(error=er.orig))
        raise abort(500, "There was an error retrieving events from the Database")
    
    # Ensure data is in correct format
    if len(events) > 0:  
        for event in events:
            if not isinstance(event, Event):
                continue
            if "_sa_instance_state" in event.__dict__:
                event.__dict__.pop("_sa_instance_state")
            data.append(event.__dict__)

    general_logger.info("Event data is OK. Sending")
    return data, 200

    
    