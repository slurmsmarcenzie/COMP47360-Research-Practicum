from extensions.database import db

class Location(db.Model):
    location_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text, nullable=False)

    def __repr__(self):
        return f'<Location {self.location_id}>'
    
    def get_id(self):
        return self.location_id