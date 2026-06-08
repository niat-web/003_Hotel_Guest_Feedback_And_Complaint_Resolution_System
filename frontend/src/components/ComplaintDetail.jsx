function ComplaintDetail({ complaints, feedbacks }) {
  const complaint = complaints[0];

  if (!complaint) {
    return (
      <div className="page-card">
        <h1>Complaint Detail</h1>
        <p>No complaint available. Submit poor rating feedback first.</p>
      </div>
    );
  }

  const feedback = feedbacks.find((item) => item.id === complaint.feedbackId);

  return (
    <div className="page-card">
      <h1>Complaint Detail with SLA Timer</h1>

      <div className="detail-grid">
        <div className="info-card">
          <h3>Complaint Information</h3>
          <p><b>Complaint ID:</b> {complaint.id}</p>
          <p><b>Category:</b> {complaint.category}</p>
          <p><b>Department:</b> {complaint.department}</p>
          <p><b>Severity:</b> {complaint.severity}</p>
          <p><b>Status:</b> {complaint.status}</p>
          <p><b>Assigned To:</b> {complaint.assignedTo}</p>
          <p><b>SLA Deadline:</b> {new Date(complaint.slaDeadline).toLocaleString()}</p>
        </div>

        <div className="sla-card">
          <h3>SLA Deadline</h3>
          <h1>{new Date(complaint.slaDeadline).toLocaleTimeString()}</h1>
          <p>{complaint.severity} Priority Complaint</p>
        </div>
      </div>

      {feedback && (
        <div className="info-card">
          <h3>Guest Feedback</h3>
          <p>{feedback.comment || "No comment provided."}</p>
          <p>
            <b>Room:</b> {feedback.roomRating} | 
            <b> Cleanliness:</b> {feedback.cleanlinessRating} | 
            <b> Food:</b> {feedback.foodRating} | 
            <b> Staff:</b> {feedback.staffRating} | 
            <b> Value:</b> {feedback.valueRating}
          </p>
        </div>
      )}
    </div>
  );
}

export default ComplaintDetail;