const axios = require("axios")

const queryPrediction = (req, res) => {
    console.log("query receieved for:", req.params)
    
    //fetch prediction from ML:
    const {event, metric, location, date} = req.params
    const uri = `http://44.204.145.251/${event}/${metric}/${location}/${date}` 

    axios.get(uri)
    .then(response => {
      res.status(200).json({"ml-algo-response": response.data})
    })
    .catch(error => {
      res.status(500).json({"error": error})
    });


}

module.exports = {queryPrediction};