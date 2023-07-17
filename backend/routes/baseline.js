const express = require('express');
const router = express.Router();
const {queryBaseline, queryEventBaseline} = require("../controllers/baseline");

router.route("/:date").get(queryBaseline);
router.route("/:date/:event").get(queryEventBaseline)

module.exports = router;