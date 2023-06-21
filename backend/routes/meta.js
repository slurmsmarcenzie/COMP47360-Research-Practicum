const express = require('express');
const router = express.Router();
const {getEvents, getMetrics} = require("../controllers/meta");


router.route("/events").get(getEvents);
router.route("/metrics").get(getMetrics);

module.exports = router;