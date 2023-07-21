from flask import request, make_response, current_app
import jwt

# Get token from request and validate it with JWT
def check_token():
    # Access denied, no key provided
    if not request.args.get("key"):
        return make_response("You must provide a valid key to make API calls",
                              401)
    try:
        # Access granted, key provided is valid
        jwt.decode(request.args.get("key"), current_app.config["SECRET_KEY"], algorithms=["HS256"])
    except:
        # Access denied, key provided is invalid
        return make_response("Invalid API key", 401)
    

