import logging

"""
Create and sets up logging for the API
Loggers are initialized and set to write logs in './logs/'

Due to an issue with logging.FileHandler, log files are not being automatically 
created if they dont already exist. This should be the default behaviour. 
Currently, files are being created manually as a work-around

Two Loggers:
> General Logger is responsible for logging general system logs/warnings
> HTTP Logger is reponsible for logging HTTP requests and responses within the API

"""

## Create log files
http_file = open('/logs/http.log', 'a')
general_file = open('/logs/general.log', 'a')
priority_file = open('/logs/priority.log', 'a')

## GENERAL LOGGER
# General Logger is called as needed to log application events
general_logger = logging.getLogger("general_logger")
general_logger.setLevel(logging.DEBUG)
formatter = logging.Formatter("[%(levelname)s] %(asctime)s [%(filename)s : %(funcName)s] %(message)s")

file_handler = logging.FileHandler("logging_flask/logs/general.log")
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(formatter)

file_handler_priority = logging.FileHandler("logging_flask/logs/priority.log")
file_handler_priority.setLevel(logging.WARN)
file_handler_priority.setFormatter(formatter)

general_logger.addHandler(file_handler)
general_logger.addHandler(file_handler_priority)


## HTTP LOGGER
# Http Logger is called from app.py after every request to log http information
http_logger = logging.getLogger("http_logger")
http_logger.setLevel(logging.DEBUG)
formatter = logging.Formatter("[%(levelname)s] %(asctime)s %(message)s")
file_handler = logging.FileHandler("logging_flask/logs/http.log")
file_handler.setFormatter(formatter)
http_logger.addHandler(file_handler)