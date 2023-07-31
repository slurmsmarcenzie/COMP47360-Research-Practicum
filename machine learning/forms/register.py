from flask_wtf import FlaskForm, RecaptchaField
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import InputRequired, Length, ValidationError
from models.user import User

# A form that allows clients to register with the API to get their Access Key
class RegisterForm(FlaskForm):
    """A simple form that allows clients to create login credentials"""

    username = StringField(validators=[InputRequired(), Length(min=6,max=20)], render_kw={"placeholder":"Username"})
    password = PasswordField(validators=[InputRequired(), Length(min=6,max=20)], render_kw={"placeholder":"Password"})
    recaptcha = RecaptchaField()
    submit = SubmitField("Register")

    def validate_username(self, username):
        """Checks if the chosen username is free to use"""
        existing_user_username = User.query.filter_by(username=username.data).first()
        if existing_user_username:
            raise ValidationError("That username already exists")