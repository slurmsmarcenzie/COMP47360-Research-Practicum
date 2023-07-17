from flask import request, make_response, current_app
import jwt

def check_token():
    if not request.args.get("key"):
        return make_response("You must provide a valid key to make API calls",
                              401)
    try:
        jwt.decode(request.args.get("key"), current_app.config["SECRET_KEY"], algorithms=["HS256"])
    except:
        return make_response("Invalid API key", 401)
    

