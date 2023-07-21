from flask import Flask, request
from flask_wtf.csrf import CSRFProtect
from extensions.database import db
from extensions.limiter import limiter
from routes.blueprint import info, predict, base
from controllers.base import login_manager, bcrypt
from logging_flask.logger import http_logger
from dotenv import load_dotenv
import os

# Enables reading of .env files
load_dotenv()

# Initialize app and its features
app = Flask(__name__)
db.init_app(app)
limiter.init_app(app)
login_manager.init_app(app)
bcrypt.init_app(app)
csrf = CSRFProtect(app)

app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("SQLDB")
app.config["SECRET_KEY"] = os.getenv("SECRETKEY")
app.config["RECAPTCHA_PUBLIC_KEY"] = os.getenv("RECAPTCHA_PUBLIC")
app.config["RECAPTCHA_PRIVATE_KEY"] = os.getenv("RECAPTCHA_PRIVATE")
# app.config["SESSION_COOKIE_SAMESITE"] = "strict"
# app.config["SESSION_COOKIE_HTTPONLY"] = True

# Register app blueprints/routes
app.register_blueprint(info)
app.register_blueprint(predict)
app.register_blueprint(base)

@app.after_request
def set_headers(response):
    ## Note: these may need to be set at the web server level, not here
    ## Note: commented out for now. Headers were causing issues
    #response.headers['Content-Security-Policy'] = "default-src 'self'"
    # response.headers['X-Content-Type-Options'] = 'nosniff'
    # response.headers['X-Frame-Options'] = 'SAMEORIGIN'
    return response


## After Request decorator is used to log every http request/response in the app.
@app.after_request
def log_request_response(response):
    # Log success:
    if response.status_code < 400:
        http_logger.info(" | {ip} | {method} '{path}' | {status}".format(ip=request.remote_addr, method=request.method, path=request.path, status=response.status_code))
    # Log error:
    else:
        http_logger.error(" | {ip} | {method} '{path}' | {status}".format(ip=request.remote_addr, method=request.method, path=request.path, status=response.status_code))
    
    return response


if __name__ == "__main__":
    app.run(debug=True, port=7000)