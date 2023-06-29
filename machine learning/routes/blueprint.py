from flask import Blueprint
from controllers.meta import list_events, list_metrics
from controllers.prediction import prediction
from controllers.baseline import baseline

info = Blueprint("info", __name__)
predict = Blueprint("predict", __name__)

#ROUTES:
info.route("/info/events")(list_events)

info.route("/info/metrics")(list_metrics)

info.route("/info/baseline")(baseline)

predict.route("/predict/<string:date>")(prediction)



