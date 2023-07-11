from flask import redirect, render_template, url_for
from forms.login import LoginForm
from flask_bcrypt import Bcrypt
from forms.register import RegisterForm
from models.user import User
from flask_login import login_user, LoginManager, login_required, logout_user, current_user
from extensions.database import db

bcrypt = Bcrypt()

login_manager = LoginManager()
login_manager.login_view = "base.login"

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

def home():
    if current_user.is_authenticated:
        return redirect(url_for("base.dashboard"))
    return render_template("home.html")


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


@login_required
def dashboard():
    return render_template("dashboard.html", user=current_user)


@login_required
def logout():
    logout_user()
    return redirect(url_for("base.home"))


def register():
    if current_user.is_authenticated:
        return redirect(url_for("base.dashboard"))

    form = RegisterForm()

    if form.validate_on_submit():
        hashed_pwd = bcrypt.generate_password_hash(form.password.data)
        new_user = User(username=form.username.data, password = hashed_pwd, access_token="testtoken")
        #access token should be created, above is just for testing
        db.session.add(new_user)
        db.session.commit()
        return redirect(url_for("base.login"))

    return render_template("register.html", form=form)
