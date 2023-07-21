from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# Initialize limiter. Set request limit to 200 per day
limiter = Limiter(key_func=get_remote_address, default_limits=["200 per day"])