from extensions.database import db
from flask_login import UserMixin

# A SQLAlchemy Database Model to represent a User
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), nullable=False, unique=True)
    password = db.Column(db.String(80), nullable=False) #80 because it will get hashed
    access_token = db.Column(db.String(100), nullable=False)