const db = require("../config/db");

async function updateEscalatedComplaints() {
  await db.query(
    `UPDATE complaints
     SET status = 'Escalated'
     WHERE status != 'Resolved'
     AND sla_deadline < NOW()`
  );
}

async function getAllComplaints(req, res) {
  try {
    await updateEscalatedComplaints();

    const [rows] = await db.query(
      `SELECT
        id,
        feedback_id AS feedbackId,
        category,
        severity,
        department,
        status,
        assigned_to AS assignedTo,
        sla_deadline AS slaDeadline,
        resolved_at AS resolvedAt,
        resolution_notes AS resolutionNotes,
        created_at AS createdAt
      FROM complaints
      WHERE status != 'Resolved'
      ORDER BY id DESC`
    );

    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Get complaints MySQL error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching complaints",
      error: error.message,
    });
  }
}

async function getEscalatedComplaints(req, res) {
  try {
    await updateEscalatedComplaints();

    const [rows] = await db.query(
      `SELECT
        id,
        feedback_id AS feedbackId,
        category,
        severity,
        department,
        status,
        assigned_to AS assignedTo,
        sla_deadline AS slaDeadline,
        resolved_at AS resolvedAt,
        resolution_notes AS resolutionNotes,
        created_at AS createdAt
      FROM complaints
      WHERE status = 'Escalated'
      ORDER BY id DESC`
    );

    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Get escalated complaints MySQL error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching escalated complaints",
      error: error.message,
    });
  }
}

async function getComplaintById(req, res) {
  try {
    const complaintId = req.params.id;

    const [rows] = await db.query(
      `SELECT
        c.id,
        c.feedback_id AS feedbackId,
        c.category,
        c.severity,
        c.department,
        c.status,
        c.assigned_to AS assignedTo,
        c.sla_deadline AS slaDeadline,
        c.resolved_at AS resolvedAt,
        c.resolution_notes AS resolutionNotes,
        c.created_at AS createdAt,
        f.room_no AS roomNo,
        f.check_out_date AS checkOutDate,
        f.room_rating AS roomRating,
        f.cleanliness_rating AS cleanlinessRating,
        f.food_rating AS foodRating,
        f.staff_rating AS staffRating,
        f.value_rating AS valueRating,
        f.comment
      FROM complaints c
      JOIN guest_feedback f ON c.feedback_id = f.id
      WHERE c.id = ?`,
      [complaintId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    res.status(200).json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("Get complaint by ID MySQL error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching complaint detail",
      error: error.message,
    });
  }
}

async function resolveComplaint(req, res) {
  try {
    const complaintId = req.params.id;
    const { resolutionNotes, resolvedBy } = req.body;

    const [result] = await db.query(
      `UPDATE complaints
       SET status = 'Resolved',
           resolution_notes = ?,
           assigned_to = ?,
           resolved_at = NOW()
       WHERE id = ?`,
      [
        resolutionNotes || "Issue resolved by department team.",
        resolvedBy || "Department Supervisor",
        complaintId,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Complaint resolved successfully",
    });
  } catch (error) {
    console.error("Resolve complaint MySQL error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while resolving complaint",
      error: error.message,
    });
  }
}

module.exports = {
  getAllComplaints,
  getEscalatedComplaints,
  getComplaintById,
  resolveComplaint,
};