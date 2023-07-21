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

portal = Blueprint("portal", __name__)
limiter.limit("10/minute")(portal)


#INFO route for Event information:
info.route("api/info/events")(list_events)
info.before_request(check_token) # This checks if key is valid before allowing a success response

# PREDICT routes for model predictions and baseline
# Note: These will likely seen be renamed and reformatted
predict.route("api/baseline/")(baseline)
predict.route("api/baseline/<string:date>/<string:event>")(baseline_event) # TODO change later
predict.route("api/prediction/<string:date>/<string:event>")(prediction) # TODO change later
predict.before_request(check_token)

# BASE routes for clients to login and create/view their API key
portal.route("/portal")(home)
portal.route("/portal/login", methods=("GET", "POST"))(login)
portal.route("/portal/logout")(logout)
portal.route("/protal/register", methods=("GET", "POST"))(register)
portal.route("/portal/dashboard")(dashboard)

