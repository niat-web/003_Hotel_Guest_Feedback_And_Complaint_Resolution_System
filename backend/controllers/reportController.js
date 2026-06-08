const db = require("../config/db");

async function getWeeklyReport(req, res) {
  try {
    const [[feedbackCount]] = await db.query(
      `SELECT COUNT(*) AS totalFeedback FROM guest_feedback`
    );

    const [[complaintCount]] = await db.query(
      `SELECT COUNT(*) AS totalComplaints FROM complaints`
    );

    const [[resolvedCount]] = await db.query(
      `SELECT COUNT(*) AS resolvedComplaints
       FROM complaints
       WHERE status = 'Resolved'`
    );

    const [[escalatedCount]] = await db.query(
      `SELECT COUNT(*) AS escalatedComplaints
       FROM complaints
       WHERE status = 'Escalated'`
    );

    const [[ratingAvg]] = await db.query(
      `SELECT 
        AVG((room_rating + cleanliness_rating + food_rating + staff_rating + value_rating) / 5) 
        AS averageRating
       FROM guest_feedback`
    );

    const [complaintByDepartment] = await db.query(
      `SELECT department, COUNT(*) AS count
       FROM complaints
       GROUP BY department`
    );

    const [ratingDistribution] = await db.query(
      `SELECT room_rating AS rating, COUNT(*) AS count
       FROM guest_feedback
       GROUP BY room_rating
       ORDER BY room_rating DESC`
    );

    res.status(200).json({
      success: true,
      data: {
        totalFeedback: feedbackCount.totalFeedback,
        totalComplaints: complaintCount.totalComplaints,
        resolvedComplaints: resolvedCount.resolvedComplaints,
        escalatedComplaints: escalatedCount.escalatedComplaints,
        averageRating: Number(ratingAvg.averageRating || 0).toFixed(2),
        complaintByDepartment,
        ratingDistribution,
      },
    });
  } catch (error) {
    console.error("Weekly report MySQL error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while generating weekly report",
      error: error.message,
    });
  }
}

module.exports = {
  getWeeklyReport,
};