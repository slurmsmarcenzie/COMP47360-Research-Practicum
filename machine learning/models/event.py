from extensions.database import db

class Event(db.Model):
    """ 
    SQL ALchemy Model to represent an Event entity
    Note: events are currently hardcoded in frontend. This should be changed soon.
    """
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    location = db.Column(db.String(200), nullable=False)
    size = db.Column(db.Integer, nullable=False)

    def __repr__(self):
        return f'<Event {self.id}>'