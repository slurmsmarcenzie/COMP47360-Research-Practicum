from extensions.database import db

class Event(db.Model):
    """SQL ALchemy Model to represent an Event entity"""
    event_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text, nullable=False)
    location_id = db.Column(db.Integer,  db.ForeignKey('location.location_id'), nullable=False)
    description = db.Column(db.Text, nullable=False)
    impact_analysis = db.Column(db.Text, nullable=False)
    start_date = db.Column(db.Text, nullable=False)
    end_date = db.Column(db.Text, nullable=False)
    attendance = db.Column(db.Integer, nullable=False)

    def __repr__(self):
        return f'<Event {self.event_id}>'
    
    def get_id(self):
        return self.event_id