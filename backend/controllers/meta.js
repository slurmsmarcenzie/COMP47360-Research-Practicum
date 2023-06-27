const axios = require("axios")

const getEvents = (req, res) => {
    //fetch events from ML API
    const uri = "http://127.0.0.1:7000/info/events"

    axios.get(uri)
      .then(response => {
          if (response.data === null || response.data === undefined || response.data.length === 0){
            res.status(200).json([]); //send empty JSON list if bad response received
            //TODO - add to log
            console.log("warning, event list is empty")
          } 
          else {
            //make sure response has correct format [id, location, name, size]:
            const data = []
            for (item of response.data){
              if ("id" && "location" && "name"  && "size" in item){
                data.push(item);
              }
              else {
                console.log("warning: event skipped (incorrect format)");
              }
            }
            res.status(200).json(data)
          }
      })
      .catch(error => {
          console.log(error)
          res.status(500).json({"error": error})
      });
}

const getMetrics = (req, res) => {
    //fetch metrics from ML API
    const uri = "http://127.0.0.1:7000/info/metrics"

    axios.get(uri)
      .then(response => {
        if (response.data === null || response.data === undefined || response.data.length === 0){
          res.status(200).json([]); //send empty JSON list if bad response received
          //TODO - add to log
          console.log("warning, metric list is empty")
        }
        else {
          //make sure response has correct format [id, name]:
          const data = []
            for (item of response.data){
              if ("id" && "name" in item){
                data.push(item);
              }
              else {
                console.log("warning: metric skipped (incorrect format)");
              }
            }
            res.status(200).json(data) //response is OK and contains data
        }
      })
      .catch(error => {
        res.status(500).json({"error": error})
      });

}

module.exports = {getEvents, getMetrics};