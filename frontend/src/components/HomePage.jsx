import { useNavigate } from "react-router-dom";
import FeedbackForm from "./FeedbackForm";

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home-simple">
      <div className="home-topbar">
        <div>
          <h2>RK Suites</h2>
          <p>Guest Feedback & Complaint Resolution System</p>
        </div>

        <button
          className="manager-login-btn"
          onClick={() => navigate("/manager/login")}
        >
          Manager Login
        </button>
      </div>

      <FeedbackForm />
    </div>
  );
}

export default HomePage;