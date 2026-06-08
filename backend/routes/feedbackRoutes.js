const express = require("express");
const {
  createFeedback,
  getAllFeedback,
} = require("../controllers/feedbackController");

const router = express.Router();

router.post("/", createFeedback);
router.get("/", getAllFeedback);

module.exports = router;