from models.event import Event
from models.location import Location
from sqlalchemy import exc
from flask import abort
from logging_flask.logger import general_logger

def list_events():
    """Query Database and get a list of Event dictionaries"""

    data = []

    # Handle Database Error:
    try:
        events = Event.query.all()
    except exc.SQLAlchemyError as er:
        general_logger.error("Issue retreiving events from database: {error}".format(error=er.orig))
        raise abort(500, "There was an error retrieving events from the Database")
    
    # Ensure data is in correct format
    # "_sa_instance_state" is removed as only field names are needed
    if len(events) > 0:  
        for event in events:
            if not isinstance(event, Event):
                continue
            if "_sa_instance_state" in event.__dict__:
                event.__dict__.pop("_sa_instance_state")
            data.append(event.__dict__)

    general_logger.info("Event data is OK. Sending")
    return data, 200


def list_locations():
    """Query Database and get a list of location dictionaries"""

    data = []

    # Handle Database Error:
    try:
        locations = Location.query.all()
    except exc.SQLAlchemyError as er:
        general_logger.error("Issue retreiving locations from database: {error}".format(error=er.orig))
        raise abort(500, "There was an error retrieving locations from the Database")
    
    # Ensure data is in correct format
    # "_sa_instance_state" is removed as only field names are needed
    if len(locations) > 0:  
        for location in locations:
            if not isinstance(location, Location):
                continue
            if "_sa_instance_state" in location.__dict__:
                location.__dict__.pop("_sa_instance_state")
            data.append(location.__dict__)

    general_logger.info("Location data is OK. Sending")
    return data, 200

    
    