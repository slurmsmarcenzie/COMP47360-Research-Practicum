# -*- coding: utf-8 -*-
"""
Created on Wed Jul 26 15:44:21 2023

@author: mayak
"""

import matplotlib.pyplot as plt
import json

file = open("static/impact_events.json")
file1 = open("static/baseline_events.json")

current_data = json.load(file)
baseline_data = json.load(file1)

def create_difference_array(event_id):
    
    file = open("static/impact_events.json")
    file1 = open("static/baseline_events.json")

    current_data = json.load(file)
    baseline_data = json.load(file1)
    
    # Filter baseline data for the given event_id
    baseline_filtered = [entry for entry in baseline_data if entry["Event_ID"] == event_id]

    # Filter current data for the given event_id
    current_filtered = [entry for entry in current_data if entry["Event_ID"] == event_id]

    # Create dictionaries to store the busyness scores for each time for baseline and current data
    baseline_dict = {}
    current_dict = {}

    # Populate the dictionaries with location_id and corresponding scores for each time
    for entry in baseline_filtered:
        time = entry["time"]
        location_id = entry["location_id"]
        busyness_score = entry["busyness_score"]

        if time not in baseline_dict:
            baseline_dict[time] = {}

        baseline_dict[time][location_id] = busyness_score

    for entry in current_filtered:
        time = entry["time"]
        location_id = entry["location_id"]
        busyness_score = entry["busyness_score"]

        if time not in current_dict:
            current_dict[time] = {}

        current_dict[time][location_id] = busyness_score

    # Create the resulting array with the difference between baseline and current data
    result = []
    for time in sorted(set(baseline_dict.keys()) | set(current_dict.keys())):
        busyness_entry = {"Time": time, "busyness": {}}

        for location_id in set(baseline_dict.get(time, {}).keys()) | set(current_dict.get(time, {}).keys()):
            baseline_score = baseline_dict.get(time, {}).get(location_id, 0.0)
            current_score = current_dict.get(time, {}).get(location_id, 0.0)

            difference = current_score - baseline_score
            busyness_entry["busyness"][location_id] = difference

        result.append(busyness_entry)

    return result

event_id = 8
result_array = create_difference_array(event_id)
print(result_array)
location_ids = set()
for entry in baseline_data + current_data:
    location_ids.add(entry["location_id"])

# Plot the lines for each location ID
plt.figure(figsize=(20, 12))  # Adjust the figure size if needed
for location_id in location_ids:
    x_values = [entry["Time"] for entry in result_array]
    y_values = [entry["busyness"].get(location_id, 0.0) for entry in result_array]
    
    # You can customize the line appearance (color, marker, linestyle) here
    plt.plot(x_values, y_values, marker='+')

plt.xlabel('Time')
plt.ylabel('Busyness Difference')
plt.title(f'Busyness Difference for All Location IDs over Time')
plt.grid(True)
# plt.legend()
plt.show()


