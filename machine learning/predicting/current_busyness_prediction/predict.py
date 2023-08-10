import pandas as pd
import numpy as np
import pickle
from sklearn.preprocessing import MinMaxScaler
from predicting.data import location_ids, bins, labels

def general_prediction(date):
    """
    Loads the predictive model into memory
    Calls model with generated input and returns a dictionary of predictions

    Input: datetime
    Returns: dictionary
    """
    model_input = generate_model_input(date)
    model = pickle.load(open('predicting/models/rf_final.pkl', 'rb'))
    predictions = model.predict(model_input)
    normalized_predictions = normalise_data(predictions)
    predictions_dict = {str(location_id): float(prediction) for location_id, prediction in zip(location_ids, normalized_predictions)}
    return predictions_dict


def create_empty_dataframe():
    """
    Creates empty pandas dataframe. This is necessary to correctly order columns for model
    input.

    Input: None
    returns: pd.DataFrame
    """
    df = pd.DataFrame({'DOLocationID': location_ids})

    # Using ranges to replicate the training set order
    df['Hour'] = pd.Series(range(0, 23))
    df['DayOfWeek'] = pd.Series(range(7))
    df['DayOfMonth'] = pd.Series(range(1, 31))
    df['Month'] = pd.Series(range(1, 13))

    columns = ['Hour', 'DayOfWeek', 'DayOfMonth', 'Month']
    df[columns] = df[columns].fillna(1)
    df[columns] = df[columns].astype(int)

    df['Weekend'] = np.where(df['DayOfWeek'].isin([5, 6]), 1, 0)
    df['TimeOfDay'] = pd.cut(df['Hour'], bins=bins, labels=labels, right=False, include_lowest=True, ordered=False)

    # Encoding dummy variables
    df = pd.get_dummies(df, columns=['DOLocationID', 'TimeOfDay', 'DayOfWeek'], prefix=['DOLocationID', 'TimeOfDay', 'DayOfWeek'])

    # Resetting all rows to 0 to create an empty dataframe
    for col in df.columns:
        df[col] = 0
        
    return df


def generate_model_input(date):
    """
    Generates a Pandas Series of model input from a given datetime
    Iterates through the list of Locations and creates input for each (based on date input)

    Input: datetime
    Returns: pd.Series
    """
    Hour = date.hour
    DayOfWeek = date.isoweekday()
    DayOfMonth = date.day
    Month = date.month
    Weekend = 1 if DayOfWeek in [5, 6] else 0
    current_hour_bin = pd.cut([Hour], bins=bins, labels=labels, right=False, include_lowest=True, ordered=False)[0]

    df = create_empty_dataframe()

    rows = []
    for location_id in location_ids:
        row = pd.Series(0, index=df.columns)
        row[f'DOLocationID_{location_id}'] = 1
        row['Hour'] = Hour
        row['DayOfMonth'] = DayOfMonth
        row['Month'] = Month
        row['Weekend'] = Weekend
        row[f'DayOfWeek_{DayOfWeek}'] = 1
        row[f'TimeOfDay_{current_hour_bin}'] = 1
        rows.append(row)

    return pd.concat(rows, axis=1).T.astype(int)


def normalise_data(data):
    """
        Normalises numpy ndarray to be within the range 0 - 1
        
        Input: ndarray
        Returns: ndarray (normalized)
    """
    scaler = MinMaxScaler(feature_range=(0, 1))
    return scaler.fit_transform(np.array(data).reshape(-1, 1))
