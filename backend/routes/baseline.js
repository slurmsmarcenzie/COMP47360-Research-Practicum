const express = require('express');
const router = express.Router();
const {queryBaseline} = require("../controllers/baseline");

router.route("/:date").get(queryBaseline);
router.route("/:date/:event")

module.exports = router;