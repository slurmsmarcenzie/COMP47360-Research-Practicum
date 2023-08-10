from extensions.database import db

class Busyness(db.Model):
    """SQL ALchemy Model to represent an Busyness entity"""
    event_id = db.Column(db.Integer, db.ForeignKey('event.event_id'), primary_key=True)
    location_id = db.Column(db.Integer, db.ForeignKey('location.location_id'), primary_key=True)
    time_hour = db.Column(db.Integer, primary_key=True)
    impact = db.Column(db.Float, nullable=False)
    baseline = db.Column(db.Float, nullable=False)
    difference = db.Column(db.Float, nullable=False)

    def __repr__(self):
        return f'<Busyness {self.event_id}, {self.location_id}, {self.time_hour}>'