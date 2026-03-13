import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/auth";
import ThemeToggle from "../components/ThemeToggle";
import "../../styles/auth.css";

const SignUp = () => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleCredentialResponse = async (response) => {
    const API_URL = import.meta.env.VITE_API_URL;
    try {
      const res = await fetch(`${API_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });
      const data = await res.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/canvas");
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    if (window.google) {
      google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });
      google.accounts.id.renderButton(document.getElementById("googleBtn"), {
        theme: "outline",
        size: "large",
        shape: "pill",
      });
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await registerUser({
        email: formData.email,
        password: formData.password,
        name: formData.username,
      });
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      navigate("/canvas");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="container">
      <ThemeToggle />
      <div className="auth-card">
        <Link to="/" className="back-btn">
          &lt; BACK
        </Link>

        <h1 className="auth-title">Sign Up</h1>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">
              Email<span className="required">*</span>{" "}
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter email address"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div className="input-group">
            <label htmlFor="username">
              Username<span className="required">*</span>
            </label>
            <input
              type="text"
              id="username"
              placeholder="Enter username"
              required
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">
              Password<span className="required">*</span>
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter password"
              required
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>

          <button type="submit" className="submit-btn">
            Create account
          </button>
        </form>

        <div className="or-separator">
          <span>OR</span>
        </div>

        <div id="googleBtn" className="google-button"></div>

        <p className="switch-auth">
          Already have an account?
          <Link to="/signin" className="auth-link">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
