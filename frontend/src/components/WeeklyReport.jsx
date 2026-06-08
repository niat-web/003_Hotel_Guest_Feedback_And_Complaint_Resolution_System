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
      <div className="page-card">
        <h1>Weekly Satisfaction Report</h1>
        <p>No report data available</p>
      </div>
    );
  }

  return (
    <div className="page-card">
      <h1>Weekly Satisfaction Report</h1>

      <div className="report-grid">
        <div className="stat-card">
          <h3>Total Feedback</h3>
          <p>{report.totalFeedback}</p>
        </div>

        <div className="stat-card">
          <h3>Total Complaints</h3>
          <p>{report.totalComplaints}</p>
        </div>

        <div className="stat-card">
          <h3>Resolved Complaints</h3>
          <p>{report.resolvedComplaints}</p>
        </div>

        <div className="stat-card">
          <h3>Escalated Complaints</h3>
          <p>{report.escalatedComplaints}</p>
        </div>

        <div className="stat-card">
          <h3>Average Rating</h3>
          <p>{report.averageRating} / 5</p>
        </div>
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <h3>Complaint Count by Department</h3>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={report.complaintByDepartment}>
              <XAxis dataKey="department" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Rating Distribution</h3>

          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={report.ratingDistribution}
                dataKey="count"
                nameKey="rating"
                outerRadius={90}
                label
              >
                {report.ratingDistribution.map((entry, index) => (
                  <Cell key={index} fill={["#2563eb", "#16a34a", "#facc15", "#f97316", "#dc2626"][index]} />
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