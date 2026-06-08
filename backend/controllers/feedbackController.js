const db = require("../config/db");

function getDepartment(category) {
  const departmentMap = {
    room: "Room Service",
    cleanliness: "Housekeeping",
    food: "Restaurant",
    staff: "Front Office",
    value: "Management",
  };

  return departmentMap[category] || "Management";
}

function getSeverity(rating) {
  if (Number(rating) === 1) return "Critical";
  if (Number(rating) === 2) return "Major";
  return "Minor";
}

function getSlaDeadline(severity) {
  const deadline = new Date();

  if (severity === "Critical") {
    deadline.setHours(deadline.getHours() + 1);
  } else if (severity === "Major") {
    deadline.setHours(deadline.getHours() + 4);
  } else {
    deadline.setHours(deadline.getHours() + 24);
  }

  return deadline;
}

async function createComplaintIfNeeded(feedbackId, ratings) {
  const ratingMap = {
    room: ratings.roomRating,
    cleanliness: ratings.cleanlinessRating,
    food: ratings.foodRating,
    staff: ratings.staffRating,
    value: ratings.valueRating,
  };

  for (const [category, rating] of Object.entries(ratingMap)) {
    if (Number(rating) <= 2) {
      const severity = getSeverity(rating);
      const department = getDepartment(category);
      const slaDeadline = getSlaDeadline(severity);

      await db.query(
        `INSERT INTO complaints
        (feedback_id, category, severity, department, status, assigned_to, sla_deadline, resolution_notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          feedbackId,
          category,
          severity,
          department,
          "Open",
          "Department Supervisor",
          slaDeadline,
          "",
        ]
      );
    }
  }
}

async function createFeedback(req, res) {
  try {
    const {
      roomNo,
      checkOutDate,
      roomRating,
      cleanlinessRating,
      foodRating,
      staffRating,
      valueRating,
      comment,
    } = req.body;

    if (
      !roomNo ||
      !checkOutDate ||
      !roomRating ||
      !cleanlinessRating ||
      !foodRating ||
      !staffRating ||
      !valueRating
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled",
      });
    }

    const [result] = await db.query(
      `INSERT INTO guest_feedback
      (room_no, check_out_date, room_rating, cleanliness_rating, food_rating, staff_rating, value_rating, comment)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        roomNo,
        checkOutDate,
        roomRating,
        cleanlinessRating,
        foodRating,
        staffRating,
        valueRating,
        comment,
      ]
    );

    const feedbackId = result.insertId;

    await createComplaintIfNeeded(feedbackId, {
      roomRating,
      cleanlinessRating,
      foodRating,
      staffRating,
      valueRating,
    });

    res.status(201).json({
      success: true,
      message: "Feedback saved successfully",
      data: {
        id: feedbackId,
        roomNo,
        checkOutDate,
        roomRating,
        cleanlinessRating,
        foodRating,
        staffRating,
        valueRating,
        comment,
      },
    });
  } catch (error) {
    console.error("Create feedback error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while submitting feedback",
      error: error.message,
    });
  }
}

async function getAllFeedback(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT
        id,
        room_no AS roomNo,
        check_out_date AS checkOutDate,
        room_rating AS roomRating,
        cleanliness_rating AS cleanlinessRating,
        food_rating AS foodRating,
        staff_rating AS staffRating,
        value_rating AS valueRating,
        comment,
        created_at AS createdAt
      FROM guest_feedback
      ORDER BY id DESC`
    );

    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Get feedback error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching feedback",
      error: error.message,
    });
  }
}

module.exports = {
  createFeedback,
  getAllFeedback,
};