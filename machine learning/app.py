from flask import Flask, request   
from extensions.database import db
from routes.blueprint import info, predict, base
from logging_flask.logger import http_logger
from extensions.limiter import limiter
from controllers.base import login_manager, bcrypt

app = Flask(__name__)
limiter.init_app(app)
bcrypt.init_app(app)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///metainfo.db"
app.config["SECRET_KEY"] = "mysecretkey" #CHANGE this later
db.init_app(app)
app.register_blueprint(info)
app.register_blueprint(predict)
app.register_blueprint(base)
login_manager.init_app(app)

## After Request decorator is used to log every http request/response in the app.
@app.after_request
def log_request_response(response):

    if response.status_code < 400:
        http_logger.info(" | {ip} | {method} '{path}' | {status}".format(ip=request.remote_addr, method=request.method, path=request.path, status=response.status_code))
    else:
        http_logger.error(" | {ip} | {method} '{path}' | {status}".format(ip=request.remote_addr, method=request.method, path=request.path, status=response.status_code))
    
    return response




if __name__ == "__main__":
    app.run(debug=True, port=7000)