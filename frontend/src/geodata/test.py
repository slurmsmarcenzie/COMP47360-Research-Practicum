import json

def generate_array(eventID, start, end):
    file = open("impact_events.json")
    original = json.load(file)

    # Initialize list of dictionaries
    filtered = []
    for _ in range(start, end):
        filtered.append({})

    print(filtered)
    print(len(filtered))

    for item in original:
        if item["Event_ID"] == eventID and start <= item['time'] < end:
            # Directly add the location_id: busyness_score pair to the group corresponding to the time
            filtered[item['time'] - start][item['location_id']] = item['busyness_score']

    return filtered


x = generate_array(1, 12, 23)

print(x)