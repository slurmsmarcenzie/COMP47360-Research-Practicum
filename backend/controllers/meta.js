const axios = require("axios")

const getEvents = (req, res) => {
    //fetch events from ML API
    const uri = "http://127.0.0.1:7000/info/events"
    axios.get(uri)
    .then(response => {
        res.status(200).json(response.data)
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
      res.status(200).json(response.data)
    })
    .catch(error => {
      res.status(500).json({"error": error})
    });

}

module.exports = {getEvents, getMetrics};