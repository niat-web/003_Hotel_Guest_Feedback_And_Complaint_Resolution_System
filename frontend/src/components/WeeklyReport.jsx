import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

function WeeklyReport({ report }) {
  if (!report) {
    return (
      <div className="dashboard-card">
        <h1>Weekly Satisfaction Report</h1>
        <p>No report data available.</p>
      </div>
    );
  }

  const departmentData = report.complaintByDepartment || [];
  const ratingData = report.ratingDistribution || [];

  const colors = ["#2563eb", "#16a34a", "#facc15", "#f97316", "#dc2626"];

  return (
    <div className="dashboard-card">
      <h1>Weekly Satisfaction Report</h1>

      <div className="report-summary">
        <div className="stat-card">
          <h3>Total Feedback</h3>
          <p>{report.totalFeedback || 0}</p>
        </div>

        <div className="stat-card">
          <h3>Total Complaints</h3>
          <p>{report.totalComplaints || 0}</p>
        </div>

        <div className="stat-card">
          <h3>Resolved Complaints</h3>
          <p>{report.resolvedComplaints || 0}</p>
        </div>

        <div className="stat-card">
          <h3>Escalated Complaints</h3>
          <p>{report.escalatedComplaints || 0}</p>
        </div>

        <div className="stat-card">
          <h3>Average Rating</h3>
          <p>{report.averageRating || 0} / 5</p>
        </div>
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <h3>Complaint Count by Department</h3>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={departmentData}>
              <XAxis dataKey="department" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Rating Distribution</h3>

          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={ratingData}
                dataKey="count"
                nameKey="rating"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label
              >
                {ratingData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default WeeklyReport;