const axios = require("axios")

const queryPrediction = (req, res) => {
    console.log("prediction requested for:", req.params)
    
    //fetch prediction from ML:
    const datetime = req.params.datetime
    const uri = `http://127.0.0.1:7000/predict/${datetime}` 

    axios.get(uri)
    .then(response => {
      res.status(200).json(response.data)
    })
    .catch(error => {
      res.status(500).json({"error": error})
    });


}

module.exports = {queryPrediction};