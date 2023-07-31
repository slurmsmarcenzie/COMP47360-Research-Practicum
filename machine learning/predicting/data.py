# IDs for the 67 locations in our application
location_ids = [236, 42, 166, 68, 163, 87, 152, 141, 229, 90, 113, 79, 140, 151, 107, 263, 43, 24, 233, 238, 237, 249, 186, 262, 74, 4, 45, 48, 142, 170, 137, 261, 246, 41, 239, 148, 243, 153, 231, 114, 211, 164, 144, 13, 161, 125, 50, 162, 234, 202, 224, 244, 158, 232, 88, 75, 127, 143, 116, 100, 209, 120, 230, 12, 194, 128, 105]

# Bins and Labels for Time Of Day features
bins = [0, 6, 12, 17, 22, 24]
labels = ['Night', 'Morning', 'Afternoon', 'Evening', 'Night']

# Busiest time for each event (i.e. event1 : 15:00)
peak_times = {
    "1":15,
    "2":13,
    "3":19,
    "4":0,
    "5":19,
    "6":13,
    "7":19,
    "8":22
}