from models.metric import Metric
from sqlalchemy import exc
from flask import abort

# Query Database and get a list of Metric dictionaries
# "_sa_instance_state" is removed as only field names are needed
def list_metrics():
    metrics = []
    data = []

    try:
        metrics = Metric.query.all()
    except exc.SQLAlchemyError as er:
        print(er)
        #TODO - add to log
        raise abort(500, "There was an error retrieving metrics from the Database")

    if len(metrics) > 0:    
        for metric in metrics:
            if not isinstance(metric, Metric):
                continue
            if "_sa_instance_state" in metric.__dict__:
                metric.__dict__.pop("_sa_instance_state")
            data.append(metric.__dict__)
    return data
