import pickle
import pandas as pd

col_names = ['DOLocationID', 'Hour', 'DayOfMonth', 'Month', 'Weekend', 'TimeOfDay_Afternoon', 'TimeOfDay_Evening', 'TimeOfDay_Morning', 'TimeOfDay_Night', 'DayOfWeek_0', 'DayOfWeek_1', 'DayOfWeek_2', 'DayOfWeek_3', 'DayOfWeek_4', 'DayOfWeek_5', 'DayOfWeek_6']

location_ids = [236, 42, 166, 68, 163, 87, 152, 141, 229, 90, 113, 79, 140, 151, 107, 263, 43, 24, 233, 238, 237, 249, 186, 262, 74, 4, 45, 48, 142, 170, 137, 261, 246, 41, 239, 148, 243, 153, 231, 114, 211, 164, 144, 13, 161, 125, 50, 162, 234, 202, 224, 244, 158, 232, 88, 75, 127, 143, 116, 100, 209, 120, 230, 12, 194, 128, 105]


def general_prediction(date):
    pickled_model = pickle.load(open('predicting/models/equal_weighted  _merged_model.pkl', 'rb'))
    data = []
    input_data = generate_model_input(date)

    for loc in location_ids:
        input_data[0] = loc
        df = pd.DataFrame([input_data], columns=col_names)
        score = pickled_model.predict(df) * 10
        data.append({"location_id":loc, "busyness_score":str(score[0])})

    return data

def generate_model_input(date):
    hour = date.hour
    dayOfMonth = date.day
    month = date.month
    day = date.isoweekday()
    weekend = 1 if day > 5 else 0 

    dow0 = 0
    dow1 = 0
    dow2 = 0
    dow3 = 0
    dow4 = 0 
    dow5 = 0 
    dow6 = 0

    todA = 0
    todE = 0
    todM = 0
    todN = 0

    match day:
        case 1:
            dow0 = 1
        case 2:
            dow1 = 1
        case 3:
            dow2 = 1
        case 4: 
            dow3 = 1
        case 5:
            dow4 = 1
        case 6:
            dow5 = 1
        case 7:
            dow6 = 1

    if hour >= 0 and hour < 6:
        todN = 1
    elif hour < 12:
        todM = 1
    elif hour < 17:
        todA = 1
    elif hour < 22:
        todE = 1
    elif hour < 24:
        todN = 1

    return [0, hour, dayOfMonth, month, weekend,
                  todA,todE,todM,todN,
                  dow0, dow1, dow2, dow3, dow4, dow5, dow6]


