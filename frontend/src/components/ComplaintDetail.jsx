function ComplaintDetail({ complaints }) {
  if (!complaints || complaints.length === 0) {
    return (
      <div className="dashboard-card">
        <h1>Complaint Detail</h1>
        <p>No complaint available. Submit poor rating feedback first.</p>
      </div>
    );
  }

  const getRemainingTime = (deadline) => {
    const now = new Date();
    const end = new Date(deadline);
    const diff = end - now;

    if (diff <= 0) {
      return "SLA Breached";
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff / (1000 * 60)) % 60);

    return `${hours}h ${minutes}m left`;
  };

  return (
    <div className="dashboard-card">
      <h1>Complaint Details with SLA Timer</h1>

      <div className="complaint-detail-list">
        {complaints.map((complaint) => (
          <div className="complaint-detail-card" key={complaint.id}>
            <div>
              <h3>Complaint Information</h3>

              <p>
                <strong>Complaint ID:</strong> {complaint.id}
              </p>

              <p>
                <strong>Feedback ID:</strong> {complaint.feedbackId}
              </p>

              <p>
                <strong>Category:</strong> {complaint.category}
              </p>

              <p>
                <strong>Department:</strong> {complaint.department}
              </p>

              <p>
                <strong>Severity:</strong> {complaint.severity}
              </p>

              <p>
                <strong>Status:</strong> {complaint.status}
              </p>
            </div>

            <div className="sla-box">
              <h3>SLA Deadline</h3>

              <h2>{new Date(complaint.slaDeadline).toLocaleString()}</h2>

              <p>{getRemainingTime(complaint.slaDeadline)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}



export default ComplaintDetail;