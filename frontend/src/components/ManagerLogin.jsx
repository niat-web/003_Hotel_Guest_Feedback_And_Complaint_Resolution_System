import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ManagerLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleLogin = (event) => {
    event.preventDefault();

    if (
      form.email === "manager@rksuites.com" &&
      form.password === "123456"
    ) {
      localStorage.setItem("managerLoggedIn", "true");
      navigate("/manager/dashboard");
    } else {
      alert("Invalid manager login details");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>RK Suites</h1>
        <h2>Manager Login</h2>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Manager Email"
            value={form.email}
            onChange={(event) =>
              setForm({ ...form, email: event.target.value })
            }
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(event) =>
              setForm({ ...form, password: event.target.value })
            }
            required
          />

          <button className="primary-btn" type="submit">
            Login
          </button>
        </form>

        <p className="demo-login">
          Demo Login: manager@rksuites.com / 123456
        </p>
      </div>
    </div>
  );
}

export default ManagerLogin;