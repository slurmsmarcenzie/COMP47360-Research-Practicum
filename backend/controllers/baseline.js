const axios = require("axios")
const { generalLogger } = require("../../logging/backend/express/logger");

//fetch baseline from ML:
const queryBaseline = (req, res, next) => {
    res.req.ip //sets the object
    // get date from params and fix it to be the correct format
    let date = new Date(Date.parse(req.params.date)).toISOString();
    generalLogger.info(`baseline requested for: ${req.params}`)
    generalLogger.info(`converted to ISOString: ${date}`);

    const uri = `http://127.0.0.1:7000/baseline/${date}` 

    axios.get(uri)
      .then(response => {
        if (response.data === null || response.data === undefined || response.data.length === 0){
          generalLogger.warn("warning, baseline list is empty")
          res.status(200).json([]); //send empty JSON list if empty response received
          next()
        }
        else {
          //make sure response has correct format [location_id, busyness_score]:
          const data = []
            for (item of response.data){
              if ("busyness_score" && "location_id" in item){
                data.push(item);
              }
              else {
                generalLogger.warn("warning: baseline item skipped (incorrect format)");
              }
            }
            generalLogger.info("response is OK and contains data")
            res.status(200).json(data)
            next()
        }
      })
      .catch(error => {
        generalLogger.error(`error getting baseline: ${error}`)
        res.status(500).json({"error": error})
        next()
      });


}

module.exports = {queryBaseline};