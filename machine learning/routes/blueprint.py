from flask import Blueprint
from controllers.meta import list_events, list_locations
from controllers.predict import current
from controllers.historic import event_baseline, event_impact, event_comparison, event_timelapse_baseline, event_timelapse_impact
from controllers.portal import home, login, logout, register, dashboard
from extensions.limiter import limiter
from extensions.check_token import check_token

## BLUEPRINT SETUP ##

#Associate routes with Blueprint and set rate limiters:
meta = Blueprint("meta", __name__)
limiter.limit("25/minute")(meta)

prediction = Blueprint("prediction", __name__)
limiter.limit("20/minute")(prediction)

historic = Blueprint("historic", __name__)
limiter.limit("20/minute")(historic)

portal = Blueprint("portal", __name__)
limiter.limit("10/minute")(portal)


## ROUTES ##

#META route (for Event information):
meta.route("/api/meta/events")(list_events)
meta.route("/api/meta/locations")(list_locations)
meta.before_request(check_token) # This checks if key is valid before allowing a success response

#PREDICT route for (model predictions):
prediction.route("/api/prediction/current")(current)
prediction.before_request(check_token)

#HISTORIC route (for baselines and impact):
historic.route("/api/historic/<string:eventID>/baseline")(event_baseline)
historic.route("/api/historic/<string:eventID>/impact")(event_impact)
historic.route("/api/historic/<string:eventID>/comparison")(event_comparison)
historic.route("/api/historic/<string:eventID>/timelapse/impact")(event_timelapse_impact)
historic.route("/api/historic/<string:eventID>/timelapse/baseline")(event_timelapse_impact)
historic.before_request(check_token)

# PORTAL routes (for clients to login and create/view their API key):
portal.route("/portal")(home)
portal.route("/portal/login", methods=("GET", "POST"))(login)
portal.route("/portal/logout")(logout)
portal.route("/portal/register", methods=("GET", "POST"))(register)
portal.route("/portal/dashboard")(dashboard)

