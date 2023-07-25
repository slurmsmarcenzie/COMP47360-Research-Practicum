const express = require('express');
const router = express.Router();
const {eventImpact, eventBaseline} = require("../controllers/historic");

// Router for 'app/v1/historic/$event/baseline' and 'app/v1/historic/$event/impact'
router.route("/:eventID/baseline").get(eventBaseline)
router.route("/:eventID/impact").get(eventImpact);

module.exports = router;