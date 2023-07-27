const express = require('express');
const router = express.Router();
const {getEvents} = require("../controllers/meta");

// Router for 'app/v1/meta/events'
router.route("/events").get(getEvents);

module.exports = router;