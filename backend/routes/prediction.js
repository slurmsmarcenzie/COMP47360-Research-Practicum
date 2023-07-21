const express = require('express');
const router = express.Router();
const {queryPrediction} = require("../controllers/prediction");

// Router for 'app/v1/prediction/$date/$event'
router.route("/:date/:event").get(queryPrediction);

module.exports = router;