import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "./Sidebar";
import ComplaintDashboard from "./ComplaintDashboard";
import ComplaintDetail from "./ComplaintDetail";
import ResolutionLogging from "./ResolutionLogging";
import ManagerEscalation from "./ManagerEscalation";
import WeeklyReport from "./WeeklyReport";

import API from "../services/api";

function ManagerDashboard() {
  const navigate = useNavigate();

  const [activePage, setActivePage] = useState("complaints");
  const [feedbacks, setFeedbacks] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const refreshData = async () => {
    try {
      setLoading(true);

      const feedbackResponse = await API.get("/feedback");
      const complaintResponse = await API.get("/complaints");
      const reportResponse = await API.get("/reports/weekly");

      setFeedbacks(feedbackResponse.data.data || []);
      setComplaints(complaintResponse.data.data || []);
      setReport(reportResponse.data.data || null);
    } catch (error) {
      console.log("Data loading failed:", error);
      alert("Unable to load manager dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("managerLoggedIn");

    if (isLoggedIn !== "true") {
      navigate("/manager/login");
      return;
    }

    refreshData();

    const intervalId = setInterval(() => {
      refreshData();
    }, 3000);

    return () => clearInterval(intervalId);
  }, []);

  const logout = () => {
    localStorage.removeItem("managerLoggedIn");
    navigate("/");
  };

  const renderPage = () => {
    if (activePage === "complaints") {
      return (
        <ComplaintDashboard
          complaints={complaints}
          refreshData={refreshData}
        />
      );
    }

    if (activePage === "detail") {
      return (
        <ComplaintDetail
          complaints={complaints}
          feedbacks={feedbacks}
        />
      );
    }

    if (activePage === "resolve") {
      return (
        <ResolutionLogging
          complaints={complaints}
          refreshData={refreshData}
        />
      );
    }

    if (activePage === "escalations") {
      return <ManagerEscalation complaints={complaints} />;
    }

    if (activePage === "reports") {
      return <WeeklyReport report={report} />;
    }

    return (
      <ComplaintDashboard
        complaints={complaints}
        refreshData={refreshData}
      />
    );
  };

  return (
    <div className="layout">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      <main className="main-content">
        <div className="top-bar">
          <div>
            <h2>Manager Dashboard</h2>
            <p>View guest complaints, escalations, and reports</p>
          </div>

          <div className="top-actions">
            <button className="primary-btn" onClick={refreshData}>
              {loading ? "Refreshing..." : "Refresh Data"}
            </button>

            <button className="logout-btn" onClick={logout}>
              <span>Logout</span>
            </button>
          </div>
        </div>

        {activePage !== "reports" && (
          <div className="manager-summary">
            <div className="stat-card">
              <h3>Total Feedback</h3>
              <p>{report?.totalFeedback || 0}</p>
            </div>

            <div className="stat-card">
              <h3>Total Complaints</h3>
              <p>{report?.totalComplaints || 0}</p>
            </div>

            <div className="stat-card">
              <h3>Resolved</h3>
              <p>{report?.resolvedComplaints || 0}</p>
            </div>

            <div className="stat-card">
              <h3>Escalated</h3>
              <p>{report?.escalatedComplaints || 0}</p>
            </div>
          </div>
        )}

        {renderPage()}
      </main>
    </div>
  );
}

export default ManagerDashboard;