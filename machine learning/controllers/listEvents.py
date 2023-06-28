from models.event import Event

def list_events():
    events = Event.query.all()
    data = []
    for event in events:
        event.__dict__.pop("_sa_instance_state")
        data.append(event.__dict__)
    return data