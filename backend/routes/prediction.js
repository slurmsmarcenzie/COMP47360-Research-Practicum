const express = require('express');
const router = express.Router();
const {current} = require("../controllers/prediction");

// Router for 'app/v1/prediction/current'
router.route("/current").get(current);

module.exports = router;