const express = require('express');
const router = express.Router();
const {current, event} = require("../controllers/prediction");

// Router for 'PREDICTION/CURRENT'
router.route("/current").get(current);

module.exports = router;