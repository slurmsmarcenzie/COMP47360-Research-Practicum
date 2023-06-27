from flask import Flask
from extensions.database import db
from routes.blueprint import info, predict


app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///metainfo.db"
db.init_app(app)
app.register_blueprint(info)
app.register_blueprint(predict)


if __name__ == "__main__":
    app.run(debug=True, port=7000)