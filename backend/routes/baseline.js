const express = require('express');
const router = express.Router();
const {queryBaseline, queryEventBaseline} = require("../controllers/baseline");

// Router for 'app/v1/baseline/$date/$event' and 'app/v1/baseline'
router.route("/:date/:event").get(queryEventBaseline)
router.route("").get(queryBaseline);

module.exports = router;