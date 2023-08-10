from flask import Flask, request
from flask_wtf.csrf import CSRFProtect
from extensions.database import db
from extensions.limiter import limiter
from extensions.cache_ext import cache
from routes.blueprint import meta, prediction, historic, portal
from controllers.portal import login_manager, bcrypt
from logging_flask.logger import http_logger
from dotenv import load_dotenv
import os

# Enables reading of .env files
load_dotenv()

# Initialize app
app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("SQLDB")
app.config["SECRET_KEY"] = os.getenv("SECRETKEY")
app.config["RECAPTCHA_PUBLIC_KEY"] = os.getenv("RECAPTCHA_PUBLIC")
app.config["RECAPTCHA_PRIVATE_KEY"] = os.getenv("RECAPTCHA_PRIVATE")
app.config["CACHE_TYPE"] = os.getenv("CACHE_TYPE")
# app.config["SESSION_COOKIE_SAMESITE"] = "strict"
# app.config["SESSION_COOKIE_HTTPONLY"] = True

# Initialize features
db.init_app(app)
limiter.init_app(app)
cache.init_app(app)
login_manager.init_app(app)
bcrypt.init_app(app)
csrf = CSRFProtect(app)

# Register app blueprints/routes
app.register_blueprint(meta)
app.register_blueprint(prediction)
app.register_blueprint(historic)
app.register_blueprint(portal)

@app.after_request
def set_headers(response):
    """
    Sets security headers on responses.
    
    Currently all have been deactivated. Once we have a stable deployment I will
    re-introduce each of the headers.
    """
    ## Note: these may need to be set at the web server level, not here
    ## Note: commented out for now. Headers were causing issues
    #response.headers['Content-Security-Policy'] = "default-src 'self'"
    # response.headers['X-Content-Type-Options'] = 'nosniff'
    # response.headers['X-Frame-Options'] = 'SAMEORIGIN'
    return response


@app.after_request
def log_request_response(response):
    """
    Takes request and generates a http log with it, and the resulting response info.
    Every req/res in the API is logged in 'logging_flask/logs/http.log'
    """

    # Log success:
    if response.status_code < 400:
        http_logger.info(" | {ip} | {method} '{path}' | {status}".format(ip=request.remote_addr, method=request.method, path=request.path, status=response.status_code))
    # Log error:
    else:
        http_logger.error(" | {ip} | {method} '{path}' | {status}".format(ip=request.remote_addr, method=request.method, path=request.path, status=response.status_code))
    
    return response

## START API
if __name__ == "__main__":
    app.run(debug=False, port=7000)