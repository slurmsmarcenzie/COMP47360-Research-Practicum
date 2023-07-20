from flask import Blueprint
from controllers.meta import list_events
from controllers.prediction import prediction
from controllers.baseline import baseline, baseline_event
from controllers.base import home, login, logout, register, dashboard
from extensions.limiter import limiter
from extensions.check_token import check_token

#Associate routes with Blueprint and set rate limiters:
info = Blueprint("info", __name__)
limiter.limit("25/minute")(info)

predict = Blueprint("predict", __name__)
limiter.limit("10/minute")(predict)

base = Blueprint("base", __name__)
limiter.limit("10/minute")(base)


#INFO route for Event information:
info.route("/info/events")(list_events)
info.before_request(check_token)

predict.route("/baseline/")(baseline)
predict.route("/baseline/<string:date>/<string:event>")(baseline_event)
predict.route("/predict/<string:date>/<string:event>")(prediction)
predict.before_request(check_token)

# BASE routes for clients to login and create/view their API key
base.route("/")(home)
base.route("/login", methods=("GET", "POST"))(login)
base.route("/logout")(logout)
base.route("/register", methods=("GET", "POST"))(register)
base.route("/dashboard")(dashboard)

