const express = require("express");
const cors = require("cors");
require("dotenv").config();

const feedbackRoutes = require("./routes/feedbackRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const reportRoutes = require("./routes/reportRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hotel Guest Feedback Backend is running");
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    project: "Hotel Guest Feedback And Complaint Resolution System",
    database: "MySQL",
  });
});

app.use("/api/feedback", feedbackRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/reports", reportRoutes);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});