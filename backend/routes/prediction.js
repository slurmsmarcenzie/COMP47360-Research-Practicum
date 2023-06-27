const express = require('express');
const router = express.Router();
const {queryPrediction} = require("../controllers/prediction");

router.route("/:datetime").get(queryPrediction);

module.exports = router;