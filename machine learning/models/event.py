from extensions.database import db

# A SQLAlchemy Database Model to represent an Event
# Note: events are currently hardcoded in frontend. Should change this later
class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    location = db.Column(db.String(200), nullable=False)
    size = db.Column(db.Integer, nullable=False)

    def __repr__(self):
        return f'<Event {self.id}>'