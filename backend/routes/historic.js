const express = require('express');
const router = express.Router();
const {eventImpact, eventBaseline, eventComparison} = require("../controllers/historic");

// Router for 'app/v1/historic/$event/baseline' and 'app/v1/historic/$event/impact'
router.route("/:event/baseline").get(eventBaseline)
router.route("/:event/impact").get(eventImpact);
router.route("/:event/comparison").get(eventComparison);

module.exports = router;