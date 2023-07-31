const express = require('express');
const router = express.Router();
const {getEvents} = require("../controllers/meta");

// Router for 'META/EVENTS'
router.route("/events").get(getEvents);

module.exports = router;