from extensions.database import db
from flask_login import UserMixin

class User(db.Model, UserMixin):
    """
    SQL ALchemy Model to represent a User entity
    Users gave an ID, Username, Password(encrypted) and Access Token
    """
    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.Text, nullable=False, unique=True)
    password = db.Column(db.Text, nullable=False) 
    access_token = db.Column(db.Text, nullable=False)

    def __repr__(self):
        return f'<User {self.user_id}>'
    
    def get_id(self):
        return self.user_id