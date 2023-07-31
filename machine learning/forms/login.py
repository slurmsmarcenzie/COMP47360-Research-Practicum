from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import InputRequired, Length

class LoginForm(FlaskForm):
    """A simple form that allows clients to provide their login credentials"""
    
    username = StringField(validators=[InputRequired(), Length(min=6,max=20)], render_kw={"placeholder":"Username"})
    password = PasswordField(validators=[InputRequired(), Length(min=6,max=20)], render_kw={"placeholder":"Password"})
    submit = SubmitField("Login")