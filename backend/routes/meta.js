const express = require('express');
const router = express.Router();
const {getEvents, getLocations} = require("../controllers/meta");

// Router for 'META/EVENTS'
router.route("/events").get(getEvents);
router.route("/locations").get(getLocations);

module.exports = router;