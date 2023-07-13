from flask import Blueprint
from controllers.meta import list_events, list_metrics
from controllers.prediction import prediction
from controllers.baseline import baseline
from controllers.base import home, login, logout, register, dashboard
from extensions.limiter import limiter
from extensions.check_token import check_token

info = Blueprint("info", __name__)
limiter.limit("25/minute")(info)

predict = Blueprint("predict", __name__)
limiter.limit("10/minute")(predict)

base = Blueprint("base", __name__)
limiter.limit("10/minute")(base)


#ROUTES:
info.route("/info/events")(list_events)
info.route("/info/metrics")(list_metrics)
info.before_request(check_token)

predict.route("/baseline/<string:date>")(baseline)
predict.route("/predict/<string:date>")(prediction)
predict.before_request(check_token)

base.route("/")(home)
base.route("/login", methods=("GET", "POST"))(login)
base.route("/logout")(logout)
base.route("/register", methods=("GET", "POST"))(register)
base.route("/dashboard")(dashboard)

