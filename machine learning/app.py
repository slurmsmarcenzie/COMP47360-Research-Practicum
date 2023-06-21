from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///metainfo.db"
db = SQLAlchemy(app)

@app.route("/events")
def list_events():
    events = Event.query.all()
    data = []
    for event in events:
        event.__dict__.pop("_sa_instance_state")
        data.append(event.__dict__)
    return data

@app.route("/metrics")
def list_metrics():
    metrics = Metric.query.all()
    data = []
    for metric in metrics:
        metric  .__dict__.pop("_sa_instance_state")
        data.append(metric.__dict__)
    return data

@app.route('/<string:event>/<string:metric>/<string:location>/<string:date>', methods=["POST", "GET"])
def predict(event, metric, location, date):
    #do some work with metrics, return the prediction
    object = {
        "prediction": 0.67
              }
    return object


#Models:
class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    location = db.Column(db.String(200), nullable=False)
    size = db.Column(db.Integer, nullable=False)

    def __repr__(self):
        return f'<Event {self.id}>'
    

class Metric(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)

    def __repr__(self):
        return f'<Metric {self.id}>'   


if __name__ == "__main__":
    app.run(debug=True, port=7000)