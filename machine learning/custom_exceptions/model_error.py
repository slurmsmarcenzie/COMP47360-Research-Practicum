from logging_flask.logger import general_logger

class ModelError(Exception):
    """A Custom Exception for Model problems"""
    def __init__(self, message):
        general_logger.error(message)
        super().__init__(message)