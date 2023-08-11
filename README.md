# COMP47360-Research-Practicum

## Development setup

A) Download zip of branch 'production' or clone repository to local environment and checkout branch 'production'\
B) Ensure that global version of npm is > 9 and node is > 18

### Steps:

**Installations:**

1) in 'backend' folder, run npm install
2) in 'machine learning' folder, create virtual environment, activate, and run 'pip install -r requirements.txt'

**Environment variables:**

In 'backend' folder, create file '.env'
   
Fill file with the following (note, below is a testing/development key):

FLASK_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiZGV2ZWxvcGVyIn0.IF_FDOmKtZ_HAJnJj-ZN05GSTzqlrUgVg_I9M1Vfh24\
PORT=8000\
FLASK_API_URL=http://127.0.0.1:7000/api

In 'machine learning' folder, create file '.env'

Fill file with the following (note, recaptcha keys below are for testing/development):

SQLDB=sqlite:///api_database.db\
SECRETKEY=[enter key of your choosing here]\
RECAPTCHA_PRIVATE=6LdKjJonAAAAAGi1HM7uC38KFk5y7tbv1LOFV0Y-\
RECAPTCHA_PUBLIC=6LdKjJonAAAAAKMcyTbRd4m4-GI2eia7R2HExuSh\
CACHE_TYPE=simple


**Running the application:**

1) in 'backend' run node server
2) in 'machine learning' activate python environment and run 'python app.py'
3) Visit http://localhost:8000

**Additional**

It is possible to use the 'machine learning' folder externally for running our Flask Prediction API.\
The Flask API has its own login portal if you wish to generate new API access tokens. This page is found at http://localhost:7000/portal

