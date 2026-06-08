import express from 'express';
import cors from 'cors';
import { Op } from 'sequelize';
import sequelize, { Feedback, Complaint } from './db.js';
import { seedDatabase } from './mockGenerator.js';


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// SLA Hours config
const SLA_HOURS = {
  Critical: 1, // 1 hour
  Major: 4,    // 4 hours
  Minor: 24,   // 24 hours
};

// Department Routing mapping
const DEPARTMENT_ROUTING = {
  Room: 'Maintenance',
  Cleanliness: 'Housekeeping',
  Food: 'F&B',
  Staff: 'Front Desk',
  Value: 'Front Desk',
};

// Helper: Check and apply SLA escalations for overdue complaints
const checkSlaEscalations = async () => {
  try {
    const now = new Date();
    // Find all complaints that are Pending or In Progress and have breached their SLA deadline
    const breachedComplaints = await Complaint.findAll({
      where: {
        status: {
          [Op.in]: ['Pending', 'In Progress'],
        },
        sla_deadline: {
          [Op.lt]: now,
        },
      },
    });

    for (const complaint of breachedComplaints) {
      await complaint.update({ status: 'Escalated' });
      console.log(`[SLA ESCALATION] Complaint ID ${complaint.id} for Room ${complaint.room_no} has been escalated to Manager.`);
    }
  } catch (error) {
    console.error('Error running SLA escalation check:', error);
  }
};

// Run SLA check periodically (every 10 seconds)
setInterval(checkSlaEscalations, 10000);

// Health check endpoint (Required by internship template)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    project: 'hotel-guest-feedback---co'
  });
});

// GET all feedback
app.get('/api/guest_feedback', async (req, res) => {
  try {
    const feedbacks = await Feedback.findAll({
      order: [['createdAt', 'DESC']],
    });
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST feedback (auto-flags complaints if any rating is <= 2)
app.post('/api/guest_feedback', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      room_no,
      guest_name,
      room_rating,
      cleanliness_rating,
      food_rating,
      staff_rating,
      value_rating,
      comment
    } = req.body;

    // Server-side validation
    if (!room_no || !guest_name) {
      return res.status(400).json({
        success: false,
        message: 'Room number and guest name are required fields.'
      });
    }

    const parseRating = (val) => {
      const num = parseInt(val, 10);
      if (isNaN(num) || num < 1 || num > 5) {
        throw new Error('All ratings must be integers between 1 and 5.');
      }
      return num;
    };

    let rRating, cRating, fRating, sRating, vRating;
    try {
      rRating = parseRating(room_rating);
      cRating = parseRating(cleanliness_rating);
      fRating = parseRating(food_rating);
      sRating = parseRating(staff_rating);
      vRating = parseRating(value_rating);
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    // Create feedback
    const feedback = await Feedback.create({
      room_no,
      guest_name,
      room_rating: rRating,
      cleanliness_rating: cRating,
      food_rating: fRating,
      staff_rating: sRating,
      value_rating: vRating,
      comment
    }, { transaction: t });

    // Auto-flag complaints
    const ratings = [
      { key: 'Room', rating: rRating, text: 'Room Quality' },
      { key: 'Cleanliness', rating: cRating, text: 'Housekeeping' },
      { key: 'Food', rating: fRating, text: 'Food Service' },
      { key: 'Staff', rating: sRating, text: 'Staff Behavior' },
      { key: 'Value', rating: vRating, text: 'Value for Money' }
    ];

    const generatedComplaints = [];

    for (const r of ratings) {
      if (r.rating <= 2) {
        // Map rating score to severity: 1 -> Critical, 2 -> Major
        const severity = r.rating === 1 ? 'Critical' : 'Major';
        const department = DEPARTMENT_ROUTING[r.key];
        const hours = SLA_HOURS[severity];
        
        const now = new Date();
        const sla_deadline = new Date(now.getTime() + (hours * 60 * 60 * 1000));

        const complaint = await Complaint.create({
          feedback_id: feedback.id,
          room_no,
          guest_name,
          category: r.text,
          severity,
          department,
          description: comment || `Automatic complaint triggered by low rating (${r.rating}/5) in ${r.text}.`,
          status: 'Pending',
          sla_deadline,
        }, { transaction: t });

        generatedComplaints.push(complaint);
      }
    }

    await t.commit();
    res.status(201).json({
      success: true,
      feedback,
      complaintsCreatedCount: generatedComplaints.length,
      complaints: generatedComplaints
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET complaints (with SLA checks applied first)
app.get('/api/complaints', async (req, res) => {
  try {
    // Run escalation check first so returned states are accurate
    await checkSlaEscalations();

    const { status, department, severity } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (department) filter.department = department;
    if (severity) filter.severity = severity;

    const complaints = await Complaint.findAll({
      where: filter,
      order: [['createdAt', 'DESC']],
      include: [Feedback]
    });

    res.json(complaints);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH update complaint status or assignee
app.patch('/api/complaints/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolution_notes, department, severity } = req.body;

    const complaint = await Complaint.findByPk(id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    const updates = {};
    if (status) {
      if (!['Pending', 'In Progress', 'Resolved', 'Escalated'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status value.' });
      }
      updates.status = status;
      if (status === 'Resolved') {
        updates.resolved_at = new Date();
        updates.resolution_notes = resolution_notes || 'Resolved by staff.';
      }
    }
    if (department) {
      updates.department = department;
    }
    if (severity) {
      if (!['Minor', 'Major', 'Critical'].includes(severity)) {
        return res.status(400).json({ success: false, message: 'Invalid severity value.' });
      }
      updates.severity = severity;
      // Re-calculate SLA deadline if changed and still unresolved
      if (complaint.status !== 'Resolved') {
        const hours = SLA_HOURS[severity];
        updates.sla_deadline = new Date(complaint.createdAt.getTime() + (hours * 60 * 60 * 1000));
      }
    }
    if (resolution_notes !== undefined) {
      updates.resolution_notes = resolution_notes;
    }

    await complaint.update(updates);
    res.json({ success: true, complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET reports and analytics
app.get('/api/reports/weekly', async (req, res) => {
  try {
    // Run escalation first
    await checkSlaEscalations();

    const feedbacks = await Feedback.findAll();
    const complaints = await Complaint.findAll();

    const totalFeedback = feedbacks.length;
    const totalComplaints = complaints.length;

    // 1. Calculate Average Ratings
    let avgRoom = 0, avgClean = 0, avgFood = 0, avgStaff = 0, avgValue = 0;
    if (totalFeedback > 0) {
      avgRoom = feedbacks.reduce((acc, f) => acc + f.room_rating, 0) / totalFeedback;
      avgClean = feedbacks.reduce((acc, f) => acc + f.cleanliness_rating, 0) / totalFeedback;
      avgFood = feedbacks.reduce((acc, f) => acc + f.food_rating, 0) / totalFeedback;
      avgStaff = feedbacks.reduce((acc, f) => acc + f.staff_rating, 0) / totalFeedback;
      avgValue = feedbacks.reduce((acc, f) => acc + f.value_rating, 0) / totalFeedback;
    }
    const overallAvg = (avgRoom + avgClean + avgFood + avgStaff + avgValue) / 5;

    // 2. Complaint counts by status
    const resolvedComplaints = complaints.filter(c => c.status === 'Resolved');
    const escalatedComplaints = complaints.filter(c => c.status === 'Escalated');
    const activeComplaints = complaints.filter(c => ['Pending', 'In Progress'].includes(c.status));

    // 3. SLA Breach calculation
    // A complaint is breached if:
    // - status is 'Escalated'
    // - OR status was resolved, but resolved_at > sla_deadline
    const breachedCount = complaints.filter(c => {
      if (c.status === 'Escalated') return true;
      if (c.status === 'Resolved' && c.resolved_at && new Date(c.resolved_at) > new Date(c.sla_deadline)) return true;
      return false;
    }).length;

    const slaComplianceRate = totalComplaints > 0 
      ? Math.round(((totalComplaints - breachedCount) / totalComplaints) * 100) 
      : 100;

    // 4. Average Resolution Time (in minutes)
    let totalResolutionTimeMs = 0;
    resolvedComplaints.forEach(c => {
      const created = new Date(c.createdAt).getTime();
      const resolved = new Date(c.resolved_at).getTime();
      totalResolutionTimeMs += (resolved - created);
    });
    const avgResolutionTimeMinutes = resolvedComplaints.length > 0 
      ? Math.round((totalResolutionTimeMs / resolvedComplaints.length) / (1000 * 60))
      : 0;

    // 5. Department Breakdown
    const departments = ['Housekeeping', 'Maintenance', 'F&B', 'Front Desk'];
    const departmentPerformance = departments.map(dept => {
      const deptComplaints = complaints.filter(c => c.department === dept);
      const total = deptComplaints.length;
      const resolved = deptComplaints.filter(c => c.status === 'Resolved').length;
      const breached = deptComplaints.filter(c => {
        if (c.status === 'Escalated') return true;
        if (c.status === 'Resolved' && c.resolved_at && new Date(c.resolved_at) > new Date(c.sla_deadline)) return true;
        return false;
      }).length;
      const pending = deptComplaints.filter(c => ['Pending', 'In Progress'].includes(c.status)).length;
      
      let deptTimeMs = 0;
      const deptResolved = deptComplaints.filter(c => c.status === 'Resolved');
      deptResolved.forEach(c => {
        deptTimeMs += (new Date(c.resolved_at).getTime() - new Date(c.createdAt).getTime());
      });
      const avgTimeMin = deptResolved.length > 0
        ? Math.round((deptTimeMs / deptResolved.length) / (1000 * 60))
        : 0;

      return {
        department: dept,
        total,
        resolved,
        pending,
        breached,
        avgResolutionTimeMinutes: avgTimeMin,
        slaCompliance: total > 0 ? Math.round(((total - breached) / total) * 100) : 100
      };
    });

    // 6. Category Breakdown
    const categories = ['Room Quality', 'Housekeeping', 'Food Service', 'Staff Behavior', 'Value for Money'];
    const categoryAnalysis = categories.map(cat => {
      const count = complaints.filter(c => c.category === cat).length;
      return { category: cat, count };
    });

    res.json({
      summary: {
        totalFeedback,
        totalComplaints,
        overallAvgRating: Number(overallAvg.toFixed(2)),
        ratings: {
          room: Number(avgRoom.toFixed(2)),
          cleanliness: Number(avgClean.toFixed(2)),
          food: Number(avgFood.toFixed(2)),
          staff: Number(avgStaff.toFixed(2)),
          value: Number(avgValue.toFixed(2))
        },
        resolvedCount: resolvedComplaints.length,
        escalatedCount: escalatedComplaints.length,
        activeCount: activeComplaints.length,
        breachedCount,
        slaComplianceRate,
        avgResolutionTimeMinutes,
      },
      departmentPerformance,
      categoryAnalysis
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Start database and server
sequelize.sync().then(async () => {
  // Seed initial data if database is empty
  await seedDatabase();
  
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to sync database:', err);
});
