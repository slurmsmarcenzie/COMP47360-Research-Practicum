from flask import Blueprint
from controllers.meta import list_events
from controllers.predict import current
from controllers.historic import event_baseline, event_impact, event_comparison, event_timelapse
from controllers.portal import home, login, logout, register, dashboard
from extensions.limiter import limiter
from extensions.check_token import check_token

#Associate routes with Blueprint and set rate limiters:
info = Blueprint("info", __name__)
limiter.limit("25/minute")(info)

prediction = Blueprint("prediction", __name__)
limiter.limit("10/minute")(prediction)

historic = Blueprint("historic", __name__)
limiter.limit("10/minute")(historic)

portal = Blueprint("portal", __name__)
limiter.limit("10/minute")(portal)


#INFO route for Event information:
info.route("/api/info/events")(list_events)
info.before_request(check_token) # This checks if key is valid before allowing a success response

#PREDICT route for model predictions
prediction.route("/api/prediction/current")(current)
prediction.before_request(check_token)

#HISTORIC route for baselines and impact
historic.route("/api/historic/<string:eventID>/baseline")(event_baseline)
historic.route("/api/historic/<string:eventID>/impact")(event_impact)
historic.route("/api/historic/<string:eventID>/comparison")(event_comparison)
historic.route("/api/historic/<string:eventID>/timelapse")(event_timelapse)
historic.before_request(check_token)

# PORTAL routes for clients to login and create/view their API key
portal.route("/portal")(home)
portal.route("/portal/login", methods=("GET", "POST"))(login)
portal.route("/portal/logout")(logout)
portal.route("/protal/register", methods=("GET", "POST"))(register)
portal.route("/portal/dashboard")(dashboard)

