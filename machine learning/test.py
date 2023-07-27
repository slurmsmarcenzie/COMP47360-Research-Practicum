import datetime

date = datetime.datetime.now()

for i in range(23):
    newdate = datetime.datetime(date.year, date.hour, date.day, i)
    print(newdate)