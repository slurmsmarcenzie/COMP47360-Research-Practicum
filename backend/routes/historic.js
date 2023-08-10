const express = require('express');
const router = express.Router();
const {eventImpact, eventBaseline, 
    eventComparison, eventTimelapseBaseline, 
    eventTimelapseImpact} = require("../controllers/historic");

// Router for 'HISTORIC/EVENT/[OPTION]'
router.route("/:event/baseline").get(eventBaseline)
router.route("/:event/impact").get(eventImpact);
router.route("/:event/comparison").get(eventComparison);
router.route("/:event/timelapse/baseline").get(eventTimelapseBaseline);
router.route("/:event/timelapse/impact").get(eventTimelapseImpact);

module.exports = router;