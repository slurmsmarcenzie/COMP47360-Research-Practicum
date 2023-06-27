import json

def prediction(datetime):
    #do some work with metrics, return the prediction
    print("datetime:", datetime)
    f = open("static/MOCK_DATA.json") #may have to change path after migration to server
    data = json.load(f)
    return data 