import { useState } from "react";
import axios from "axios";

const loginStyles = `
  @import url("https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap");

  .login-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #0f2744;
    padding: 20px;
    font-family: "DM Sans", sans-serif;
    position: relative;
    overflow: hidden;
  }

  .login-page::before {
    content: "";
    position: absolute;
    top: -200px;
    right: -200px;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
  }

  .login-page::after {
    content: "";
    position: absolute;
    bottom: -150px;
    left: -150px;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(14, 165, 233, 0.08) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
  }

  .login-card {
    background: #ffffff;
    border-radius: 20px;
    padding: 44px 40px;
    width: 100%;
    max-width: 400px;
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.3);
    position: relative;
    z-index: 1;
  }

  .login-header {
    text-align: center;
    margin-bottom: 32px;
  }

  .login-logo {
    width: 56px;
    height: 56px;
    background: #0ea5e9;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: "Syne", sans-serif;
    font-weight: 800;
    font-size: 20px;
    color: white;
    margin: 0 auto 16px;
    letter-spacing: -0.5px;
    box-shadow: 0 6px 20px rgba(14, 165, 233, 0.4);
  }

  .login-header h2 {
    font-family: "Syne", sans-serif;
    font-size: 24px;
    font-weight: 700;
    color: #0f2744;
    margin: 0 0 6px;
    letter-spacing: -0.5px;
  }

  .login-header p {
    font-size: 14px;
    color: #94a3b8;
    margin: 0;
  }

  .login-form-group {
    margin-bottom: 16px;
  }

  .login-form-group label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: #64748b;
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: 0.6px;
  }

  .login-input {
    width: 100%;
    padding: 11px 14px;
    border-radius: 10px;
    border: 1.5px solid #e2e8f0;
    font-family: "DM Sans", sans-serif;
    font-size: 14px;
    color: #0f2744;
    background: #f8fafc;
    outline: none;
    transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
    box-sizing: border-box;
  }

  .login-input:focus {
    border-color: #0ea5e9;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.14);
  }

  .login-input::placeholder {
    color: #cbd5e1;
  }

  .login-btn {
    width: 100%;
    padding: 12px;
    background: #0ea5e9;
    color: white;
    border: none;
    border-radius: 10px;
    font-family: "Syne", sans-serif;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    letter-spacing: 0.2px;
    transition: background 0.18s ease, transform 0.12s ease, box-shadow 0.18s ease;
    margin-top: 8px;
    box-shadow: 0 4px 14px rgba(14, 165, 233, 0.35);
  }

  .login-btn:hover {
    background: #0284c7;
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(14, 165, 233, 0.4);
  }

  .login-btn:active {
    transform: translateY(0);
  }

  .login-divider {
    height: 1px;
    background: #e2e8f0;
    margin: 24px 0;
  }

  .login-footer {
    text-align: center;
    font-size: 12px;
    color: #94a3b8;
    margin-top: 20px;
  }

  .login-error {
    background: #fee2e2;
    border: 1px solid #fca5a5;
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 13px;
    color: #dc2626;
    margin-bottom: 16px;
    text-align: center;
  }
`;

function Login({ setIsLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      setIsLoggedIn(true);
    } catch (err) {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") login();
  };

  return (
    <>
      <style>{loginStyles}</style>
      <div className="login-page">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">MB</div>
            <h2>MedBuddy</h2>
            <p>Sign in to access the dashboard</p>
          </div>

          {error && <div className="login-error">{error}</div>}

          <div className="login-form-group">
            <label>Email Address</label>
            <input
              className="login-input"
              type="email"
              placeholder="doctor@hospital.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="login-form-group">
            <label>Password</label>
            <input
              className="login-input"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <button className="login-btn" onClick={login} disabled={loading}>
            {loading ? "Signing in..." : "Sign In →"}
          </button>

          <div className="login-footer">🔒 Secure access for medical professionals only</div>
        </div>
      </div>
    </>
  );
}

export default Login;
