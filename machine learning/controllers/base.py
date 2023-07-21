from flask import redirect, render_template, url_for, current_app
from forms.login import LoginForm
from flask_bcrypt import Bcrypt
from forms.register import RegisterForm
from models.user import User
from flask_login import login_user, LoginManager, login_required, logout_user, current_user
from extensions.database import db
import jwt

bcrypt = Bcrypt() # Used to encrypt user passwords before storing in DB
login_manager = LoginManager()
login_manager.login_view = "base.login"

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Homepage of client portal
# Login page if not logged in | Dashboard if logged in
def home():
    if current_user.is_authenticated:
        return redirect(url_for("base.dashboard"))
    return render_template("home.html")

# Login page of client portal
# Checks if credentials are valid and logs in if so
def login():
    if current_user.is_authenticated:
        return redirect(url_for("base.dashboard"))

    form = LoginForm()

    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user:
            if bcrypt.check_password_hash(user.password, form.password.data):
                login_user(user)
                return redirect(url_for("base.dashboard"))
            
    return render_template("login.html", form=form)

# Note: the login_required decorator denies access to page if user does not have a current session

# Dashboard for user. Displays their API Access Key
@login_required
def dashboard():
    return render_template("dashboard.html", user=current_user)

# Logs user out and return them to the portal homepage
@login_required
def logout():
    logout_user()
    return redirect(url_for("base.home"))

# Registers user and stores their credentials in DB
# Password encrypted with bcrypt before storage
# Forms are sent from frontend with csrf token
# User API key is generated using JSON Web Tokens (JWT)
def register():
    if current_user.is_authenticated:
        return redirect(url_for("base.dashboard"))

    form = RegisterForm()

    if form.validate_on_submit():
        key = current_app.config["SECRET_KEY"]
        token = jwt.encode({"user": form.username.data}, key)
        hashed_pwd = bcrypt.generate_password_hash(form.password.data)
        new_user = User(username=form.username.data, password = hashed_pwd, access_token=token)
        db.session.add(new_user)
        db.session.commit()
        return redirect(url_for("base.login"))

    return render_template("register.html", form=form)
