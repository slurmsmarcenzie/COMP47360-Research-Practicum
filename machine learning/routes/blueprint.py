from flask import Blueprint
from controllers.meta import list_events, list_metrics
from controllers.prediction import prediction
from controllers.baseline import baseline
from extensions.limiter import limiter

info = Blueprint("info", __name__)
limiter.limit("25/minute")(info)
predict = Blueprint("predict", __name__)
limiter.limit("10/minute")(predict)


#ROUTES:
info.route("/info/events")(list_events)

info.route("/info/metrics")(list_metrics)

predict.route("/baseline/<string:date>")(baseline)

predict.route("/predict/<string:date>")(prediction)



