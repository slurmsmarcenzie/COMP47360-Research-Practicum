const express = require('express');
const router = express.Router();
const {queryPrediction} = require("../controllers/prediction");

router.route("/:date/:event").get(queryPrediction);

module.exports = router;