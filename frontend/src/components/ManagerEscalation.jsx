function ManagerEscalation({ complaints }) {
  const escalatedComplaints = complaints.filter(
    (complaint) => complaint.status === "Escalated"
  );

  return (
    <div className="page-card">
      <h1>Manager Escalation View</h1>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Feedback ID</th>
            <th>Category</th>
            <th>Department</th>
            <th>Severity</th>
            <th>SLA Deadline</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {escalatedComplaints.map((complaint) => (
            <tr key={complaint.id}>
              <td>{complaint.id}</td>
              <td>{complaint.feedbackId}</td>
              <td>{complaint.category}</td>
              <td>{complaint.department}</td>
              <td>
                <span className={`badge ${complaint.severity.toLowerCase()}`}>
                  {complaint.severity}
                </span>
              </td>
              <td>{new Date(complaint.slaDeadline).toLocaleString()}</td>
              <td>
                <span className="badge escalated">Escalated</span>
              </td>
            </tr>
          ))}

          {escalatedComplaints.length === 0 && (
            <tr>
              <td colSpan="7" className="empty">
                No escalated complaints
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ManagerEscalation;