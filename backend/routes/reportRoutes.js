const express = require("express");
const { getWeeklyReport } = require("../controllers/reportController");

const router = express.Router();

router.get("/weekly", getWeeklyReport);

module.exports = router;