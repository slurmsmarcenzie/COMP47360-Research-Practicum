from flask import redirect, render_template, url_for, current_app
from forms.login import LoginForm
from flask_bcrypt import Bcrypt
from forms.register import RegisterForm
from models.user import User
from flask_login import login_user, LoginManager, login_required, logout_user, current_user
from extensions.database import db
import jwt

# NB: the login_required decorator denies access to page if user does not have a current session

bcrypt = Bcrypt() # Used to encrypt user passwords before storing in DB
login_manager = LoginManager()
login_manager.login_view = "portal.login"

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


def home():
    """
    Home page of client Portal

    Will redirect to the dashboard if user is already logged in
    """

    if current_user.is_authenticated:
        return redirect(url_for("portal.dashboard"))
    return render_template("home.html")


def login():
    """
    Login page of client Portal.
    Provides a form for user to log in. Validates the input and logs user in if it is OK

    Will redirect to the dashboard if user is already logged in.    
    """
    if current_user.is_authenticated:
        return redirect(url_for("portal.dashboard"))

    form = LoginForm()

    # Validates input. 
    # Checks if user exists and password matches
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user:
            if bcrypt.check_password_hash(user.password, form.password.data):
                login_user(user)
                return redirect(url_for("portal.dashboard"))
            
    return render_template("login.html", form=form)


@login_required
def dashboard():
    """
    Dashboard page of client Portal
    
    Shows the user their API access Key
    """
    return render_template("dashboard.html", user=current_user)


@login_required
def logout():
    """
    Logs user out an redirects them to the Portal Home page
    """
    logout_user()
    return redirect(url_for("portal.home"))


def register():
    """
    Register page of client Portal


    Registers user and stores their credentials in DB\n
    Password is encrypted with bcrypt before storage\n
    Forms are sent from frontend with csrf token\n
    User API key is generated using JSON Web Tokens (JWT)

     Will redirect to the dashboard if user is already logged in.
    """
    
    if current_user.is_authenticated:
        return redirect(url_for("portal.dashboard"))

    form = RegisterForm()

    if form.validate_on_submit():
        key = current_app.config["SECRET_KEY"]
        token = jwt.encode({"user": form.username.data}, key)
        hashed_pwd = bcrypt.generate_password_hash(form.password.data)
        new_user = User(username=form.username.data, password = hashed_pwd, access_token=token)
        db.session.add(new_user)
        db.session.commit()
        return redirect(url_for("portal.login"))

    return render_template("register.html", form=form)
