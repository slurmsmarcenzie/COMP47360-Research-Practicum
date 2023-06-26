import json
import random

# Load the JSON file
with open('nyc-taxi-zone.geo.json') as json_file:
    data = json.load(json_file)

output_data = []

# Loop through each feature in the features list
for feature in data["features"]:
    # Get the location_id
    location_id = feature["properties"]["location_id"]

    # Generate a random busyness score between 0 and 1
    busyness_score = random.random()

    # Add the record to the output data
    output_data.append({
        'location_id': location_id,
        'busyness_score': busyness_score
    })

# Save the output data to a new JSON file
with open('output.json', 'w') as outfile:
    json.dump(output_data, outfile)