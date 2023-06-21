import json

# Open and load the GeoJSON file
with open('nyc-taxi-zone.geo.json') as f:
    data = json.load(f)

# Create a new GeoJSON structure for the output
output = {
    'type': 'FeatureCollection',
    'features': []
}

# Loop through the features in the original file
for feature in data['features']:
    # Check if the feature has a 'properties' attribute containing a 'borough' attribute
    if 'properties' in feature and 'borough' in feature['properties']:
        # If the 'borough' attribute is 'Manhattan', append the feature to the output
        if feature['properties']['borough'] == 'Manhattan':
            output['features'].append(feature)

# Save the output GeoJSON file
with open('output.geojson', 'w') as f:
    json.dump(output, f)