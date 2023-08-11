# COMP47360-Research-Practicum

## Development setup

A) Download zip of branch 'production' or clone repository to local environment and checkout branch 'production'
B) Ensure that global version of npm is > 9 and node is > 18

### Steps:

**Installations:**
1) in 'backend' folder, run npm install
2) in 'frontend' folder, run npm install (maybe not****)
3) in 'machine learning' folder, create virtual environment, activate, and run 'pip install -r requirements.txt'

**Environment variables:**
1) in 'backend' folder, create file '.env'
   
Fill file with the following (note, below is a testing/development key):
FLASK_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiZGV2ZWxvcGVyIn0.IF_FDOmKtZ_HAJnJj-ZN05GSTzqlrUgVg_I9M1Vfh24
PORT=8000
FLASK_API_URL=http://127.0.0.1:7000/api

2) in 'machine learning' folder, create file '.env'

Fill file with the following:
SQLDB=sqlite:///api_database.db
SECRETKEY=[enter key of your choosing here]
RECAPTCHA_PRIVATE=[please generate your own keys from google's recaptcha page]
RECAPTCHA_PUBLIC=[please generate your own keys from google's recaptcha page]
CACHE_TYPE=simple


**Running the application:**
1) in 'backend' run node server
2) in 'machine learning' activate python environment and run 'python app.py'
3) Visit http://localhost:8000
