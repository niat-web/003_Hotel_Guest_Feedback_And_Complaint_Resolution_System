function ComplaintDashboard({ complaints, refreshData }) {
  return (
    <div className="page-card">
      <div className="page-header">
        <h1>Complaint Department Dashboard</h1>
        <button className="primary-btn" onClick={refreshData}>
          Refresh
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Feedback ID</th>
            <th>Category</th>
            <th>Department</th>
            <th>Severity</th>
            <th>Status</th>
            <th>SLA Deadline</th>
          </tr>
        </thead>

        <tbody>
          {complaints.map((complaint) => (
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
              <td>
                <span className={`badge ${complaint.status.toLowerCase()}`}>
                  {complaint.status}
                </span>
              </td>
              <td>{new Date(complaint.slaDeadline).toLocaleString()}</td>
            </tr>
          ))}

          {complaints.length === 0 && (
            <tr>
              <td colSpan="7" className="empty">
                No complaints available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ComplaintDashboard;