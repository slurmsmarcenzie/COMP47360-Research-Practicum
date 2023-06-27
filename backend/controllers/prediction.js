const axios = require("axios")

//fetch prediction from ML:
const queryPrediction = (req, res) => {
    // get date from params and fix it to be the correct format
    let date = new Date(Date.parse(req.params.date)).toISOString();
    // TODO - add to log
    console.log("prediction requested for:", req.params)
    console.log("converted to ISOString: ", date);

    const uri = `http://127.0.0.1:7000/predict/${date}` 

    axios.get(uri)
      .then(response => {
        if (response.data === null || response.data === undefined || response.data.length === 0){
          res.status(200).json([]); //send empty JSON list if bad response received
          //TODO - add to log
          console.log("warning, prediction list is empty")
        }
        else {
          //make sure response has correct format [location_id, busyness_score]:
          const data = []
            for (item of response.data){
              if ("busyness_score" && "location_id" in item){
                data.push(item);
              }
              else {
                console.log("warning: prediction item skipped (incorrect format)");
              }
            }
            res.status(200).json(data) //response is OK and contains data
        }
      })
      .catch(error => {
        res.status(500).json({"error": error})
      });


}

module.exports = {queryPrediction};