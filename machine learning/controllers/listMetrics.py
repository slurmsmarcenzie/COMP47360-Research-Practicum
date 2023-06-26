from models.metric import Metric

def list_metrics():
    metrics = Metric.query.all()
    data = []
    for metric in metrics:
        metric  .__dict__.pop("_sa_instance_state")
        data.append(metric.__dict__)
    return data