from flask import Blueprint
from controllers.listEvents import list_events
from controllers.listMetrics import list_metrics
from controllers.prediction import prediction

info = Blueprint("info", __name__)
predict = Blueprint("predict", __name__)

#ROUTES:
info.route("/info/events")(list_events)

info.route("/info/metrics")(list_metrics)

predict.route("/predict/<string:date>")(prediction)



