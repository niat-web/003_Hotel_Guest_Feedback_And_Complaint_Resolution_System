const express = require("express");
const {
  getAllComplaints,
  getEscalatedComplaints,
  getComplaintById,
  resolveComplaint,
} = require("../controllers/complaintController");

const router = express.Router();

router.get("/", getAllComplaints);
router.get("/escalated", getEscalatedComplaints);
router.get("/:id", getComplaintById);
router.put("/:id/resolve", resolveComplaint);

module.exports = router;