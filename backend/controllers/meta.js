const axios = require("axios")
const generalLogger = require("../logging/generalLogger")(module)

const getEvents = (req, res, next) => {
    res.req.ip // TODO: Find out why this is necessary in all controllers but getEvents 
    //fetch events from ML API
    const uri = "http://127.0.0.1:7000/info/events"

    axios.get(uri)
      .then(response => {
          if (response.data === null || response.data === undefined || response.data.length === 0){
            generalLogger.warn("warning, event list is empty")
            res.status(200).json([]); //send empty JSON list if bad response received
            next()
          } 
          else {
            //make sure response has correct format [id, location, name, size]:
            const data = []
            for (item of response.data){
              if ("id" && "location" && "name"  && "size" in item){
                data.push(item);
              }
              else {
                generalLogger.warn("warning: event skipped (incorrect format)");
              }
            }
            generalLogger.info("response is OK and contains data")
            res.status(200).json(data)
            next()
          }
      })
      .catch(error => {
          generalLogger.error(`error getting events: ${error}`)
          res.status(500).json({"error": error})
          next()
      });
}

const getMetrics = (req, res, next) => {
    res.req.ip
    //fetch metrics from ML API
    const uri = "http://127.0.0.1:7000/info/metrics"

    axios.get(uri)
      .then(response => {
        if (response.data === null || response.data === undefined || response.data.length === 0){
          generalLogger.warn("warning, metric list is empty")
          res.status(200).json([]); //send empty JSON list if bad response received
          next()
        }
        else {
          //make sure response has correct format [id, name]:
          const data = []
            for (item of response.data){
              if ("id" && "name" in item){
                data.push(item);
              }
              else {
                generalLogger.warn("warning: metric skipped (incorrect format)");
              }
            }
            generalLogger.info("response is OK and contains data")
            res.status(200).json(data)
            next()
        }
      })
      .catch(error => {
        generalLogger.error(`error getting metrics: ${error}`)
        res.status(500).json({"error": error})
        next()
      });

}

module.exports = {getEvents, getMetrics};