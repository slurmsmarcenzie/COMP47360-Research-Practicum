const express = require('express');
const router = express.Router();
const {queryPrediction} = require("../controllers/prediction");

router.route("/:event/:metric/:location/:date").get(queryPrediction);

module.exports = router;