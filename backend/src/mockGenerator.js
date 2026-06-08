import { Feedback, Complaint } from './db.js';

export async function seedDatabase() {
  const feedbackCount = await Feedback.count();
  if (feedbackCount > 0) {
    // Already has data, skip seeding
    return;
  }

  console.log('Seeding database with mock guest feedback and complaints...');

  // Helper to subtract/add time
  const getDateOffset = (hoursOffset) => {
    return new Date(Date.now() + (hoursOffset * 60 * 60 * 1000));
  };

  // 1. Create Feedbacks
  const feedbacksData = [
    {
      room_no: '204',
      guest_name: 'Aditya Rao',
      check_out_date: new Date().toISOString().split('T')[0],
      room_rating: 5,
      cleanliness_rating: 4,
      food_rating: 5,
      staff_rating: 5,
      value_rating: 4,
      comment: 'Excellent stay. The room was clean and food was great.',
      createdAt: getDateOffset(-24 * 5), // 5 days ago
    },
    {
      room_no: '108',
      guest_name: 'Sneha Reddy',
      check_out_date: new Date().toISOString().split('T')[0],
      room_rating: 2, // Low -> Complaint (Maintenance)
      cleanliness_rating: 4,
      food_rating: 4,
      staff_rating: 5,
      value_rating: 4,
      comment: 'AC was leaking water throughout the night. Very annoying.',
      createdAt: getDateOffset(-5), // 5 hours ago
    },
    {
      room_no: '302',
      guest_name: 'Rohan Sharma',
      check_out_date: new Date().toISOString().split('T')[0],
      room_rating: 5,
      cleanliness_rating: 1, // Low -> Complaint (Housekeeping)
      food_rating: 4,
      staff_rating: 4,
      value_rating: 3,
      comment: 'The bathroom was not cleaned properly. Hair in the sink.',
      createdAt: getDateOffset(-1.5), // 1.5 hours ago
    },
    {
      room_no: '412',
      guest_name: 'Ananya Sen',
      check_out_date: new Date().toISOString().split('T')[0],
      room_rating: 4,
      cleanliness_rating: 5,
      food_rating: 2, // Low -> Complaint (F&B)
      check_out_date: new Date().toISOString().split('T')[0],
      staff_rating: 3,
      value_rating: 4,
      comment: 'Breakfast was served cold and took 40 minutes to arrive.',
      createdAt: getDateOffset(-0.2), // 12 mins ago
    },
    {
      room_no: '305',
      guest_name: 'Vikram Malhotra',
      check_out_date: new Date().toISOString().split('T')[0],
      room_rating: 5,
      cleanliness_rating: 5,
      food_rating: 5,
      staff_rating: 2, // Low -> Complaint (Front Desk)
      value_rating: 3,
      comment: 'Check-in staff were very rude and kept us waiting for 30 minutes.',
      createdAt: getDateOffset(-3), // 3 hours ago
    },
    {
      room_no: '110',
      guest_name: 'Meera Nair',
      check_out_date: new Date().toISOString().split('T')[0],
      room_rating: 4,
      cleanliness_rating: 4,
      food_rating: 4,
      staff_rating: 4,
      value_rating: 5,
      comment: 'Nice place. Quick checkout and friendly staff.',
      createdAt: getDateOffset(-24 * 4), // 4 days ago
    },
    {
      room_no: '215',
      guest_name: 'Siddharth Joshi',
      check_out_date: new Date().toISOString().split('T')[0],
      room_rating: 5,
      cleanliness_rating: 5,
      food_rating: 5,
      staff_rating: 5,
      value_rating: 5,
      comment: 'Everything was absolutely perfect. Clean rooms and great service.',
      createdAt: getDateOffset(-24 * 3), // 3 days ago
    },
    {
      room_no: '301',
      guest_name: 'Priyanka Das',
      check_out_date: new Date().toISOString().split('T')[0],
      room_rating: 3,
      cleanliness_rating: 2, // Low -> Complaint (Housekeeping) - Resolved
      food_rating: 3,
      staff_rating: 4,
      value_rating: 3,
      comment: 'Towels were missing in the bathroom when we entered.',
      createdAt: getDateOffset(-24 * 2), // 2 days ago
    },
    {
      room_no: '405',
      guest_name: 'Rajesh Kumar',
      check_out_date: new Date().toISOString().split('T')[0],
      room_rating: 2, // Low -> Complaint (Maintenance) - Resolved
      cleanliness_rating: 5,
      food_rating: 4,
      staff_rating: 5,
      value_rating: 4,
      comment: 'One of the lamps next to the bed was not working.',
      createdAt: getDateOffset(-24 * 1), // 1 day ago
    }
  ];

  // Insert Feedbacks and get references
  const feedbacks = [];
  for (const f of feedbacksData) {
    const created = await Feedback.create(f);
    // Explicitly set createdAt (since Sequelize updates it automatically unless we override or force update)
    await created.update({ createdAt: f.createdAt });
    feedbacks.push(created);
  }

  // 2. Create corresponding Complaints based on ratings <= 2
  // We will configure severity and SLA details manually here to represent a realistic historical state
  
  // Feedback 1 (Aditya Rao): Ratings all high -> No complaint

  // Feedback 2 (Sneha Reddy): AC Leaking -> Maintenance, Room Rating 2 (<= 2).
  // Severity: Critical (AC leak / room issue). SLA: 1h. Created 5 hours ago.
  // It has breached the SLA (deadline was 4h ago). Status: Escalated.
  const complaint1 = await Complaint.create({
    feedback_id: feedbacks[1].id,
    room_no: feedbacks[1].room_no,
    guest_name: feedbacks[1].guest_name,
    category: 'Room Quality',
    severity: 'Critical',
    department: 'Maintenance',
    description: feedbacks[1].comment,
    status: 'Escalated',
    sla_deadline: new Date(feedbacks[1].createdAt.getTime() + (1 * 60 * 60 * 1000)), // 1 hour SLA
    createdAt: feedbacks[1].createdAt,
  });
  await complaint1.update({ createdAt: feedbacks[1].createdAt });

  // Feedback 3 (Rohan Sharma): Bathroom dirty -> Housekeeping, Cleanliness Rating 1 (<= 2).
  // Severity: Major. SLA: 4h. Created 1.5 hours ago.
  // SLA Deadline is in 2.5 hours. Status: In Progress.
  const complaint2 = await Complaint.create({
    feedback_id: feedbacks[2].id,
    room_no: feedbacks[2].room_no,
    guest_name: feedbacks[2].guest_name,
    category: 'Housekeeping',
    severity: 'Major',
    department: 'Housekeeping',
    description: feedbacks[2].comment,
    status: 'In Progress',
    sla_deadline: new Date(feedbacks[2].createdAt.getTime() + (4 * 60 * 60 * 1000)), // 4 hours SLA
    createdAt: feedbacks[2].createdAt,
  });
  await complaint2.update({ createdAt: feedbacks[2].createdAt });

  // Feedback 4 (Ananya Sen): Food cold & late -> F&B, Food Rating 2 (<= 2).
  // Severity: Minor. SLA: 24h. Created 12 minutes ago.
  // SLA Deadline is in 23 hours 48 minutes. Status: Pending.
  const complaint3 = await Complaint.create({
    feedback_id: feedbacks[3].id,
    room_no: feedbacks[3].room_no,
    guest_name: feedbacks[3].guest_name,
    category: 'Food Service',
    severity: 'Minor',
    department: 'F&B',
    description: feedbacks[3].comment,
    status: 'Pending',
    sla_deadline: new Date(feedbacks[3].createdAt.getTime() + (24 * 60 * 60 * 1000)), // 24 hours SLA
    createdAt: feedbacks[3].createdAt,
  });
  await complaint3.update({ createdAt: feedbacks[3].createdAt });

  // Feedback 5 (Vikram Malhotra): Staff rude -> Front Desk, Staff Rating 2 (<= 2).
  // Severity: Major. SLA: 4h. Created 3 hours ago.
  // SLA Deadline is in 1 hour. Status: Pending.
  const complaint4 = await Complaint.create({
    feedback_id: feedbacks[4].id,
    room_no: feedbacks[4].room_no,
    guest_name: feedbacks[4].guest_name,
    category: 'Staff Behavior',
    severity: 'Major',
    department: 'Front Desk',
    description: feedbacks[4].comment,
    status: 'Pending',
    sla_deadline: new Date(feedbacks[4].createdAt.getTime() + (4 * 60 * 60 * 1000)), // 4 hours SLA
    createdAt: feedbacks[4].createdAt,
  });
  await complaint4.update({ createdAt: feedbacks[4].createdAt });

  // Feedback 8 (Priyanka Das): Towels missing -> Housekeeping, Cleanliness Rating 2 (<= 2).
  // Severity: Minor. SLA: 24h. Created 2 days ago.
  // Resolved within 30 minutes of creation. Status: Resolved.
  const resolvedTime2 = new Date(feedbacks[7].createdAt.getTime() + (30 * 60 * 1000));
  const complaint5 = await Complaint.create({
    feedback_id: feedbacks[7].id,
    room_no: feedbacks[7].room_no,
    guest_name: feedbacks[7].guest_name,
    category: 'Housekeeping',
    severity: 'Minor',
    department: 'Housekeeping',
    description: feedbacks[7].comment,
    status: 'Resolved',
    sla_deadline: new Date(feedbacks[7].createdAt.getTime() + (24 * 60 * 60 * 1000)),
    resolved_at: resolvedTime2,
    resolution_notes: 'Delivered a fresh set of towels and apologies to the guest.',
    createdAt: feedbacks[7].createdAt,
  });
  await complaint5.update({ createdAt: feedbacks[7].createdAt, resolvedAt: resolvedTime2 });

  // Feedback 9 (Rajesh Kumar): Bed lamp not working -> Maintenance, Room Rating 2 (<= 2).
  // Severity: Minor. SLA: 24h. Created 1 day ago.
  // Resolved within 4 hours. Status: Resolved.
  const resolvedTime3 = new Date(feedbacks[8].createdAt.getTime() + (4 * 60 * 60 * 1000));
  const complaint6 = await Complaint.create({
    feedback_id: feedbacks[8].id,
    room_no: feedbacks[8].room_no,
    guest_name: feedbacks[8].guest_name,
    category: 'Room Quality',
    severity: 'Minor',
    department: 'Maintenance',
    description: feedbacks[8].comment,
    status: 'Resolved',
    sla_deadline: new Date(feedbacks[8].createdAt.getTime() + (24 * 60 * 60 * 1000)),
    resolved_at: resolvedTime3,
    resolution_notes: 'Bulb replaced by duty electrician.',
    createdAt: feedbacks[8].createdAt,
  });
  await complaint6.update({ createdAt: feedbacks[8].createdAt, resolvedAt: resolvedTime3 });

  console.log('Database seeded successfully.');
}
