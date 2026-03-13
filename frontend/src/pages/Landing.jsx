import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import "../../styles/index.css";

const Landing = () => {
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
      window.location.href = "/canvas";
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
        text: "continue_with",
        logo_alignment: "left",
      });
    }
  }, []);

  return (
    <div className="container">
      <ThemeToggle />
      <div className="content">
        <div className="header-section">
          <h1 className="title">
            <span>Sand</span>
            <span>Canvas</span>
          </h1>
        </div>

        <div style={{ marginBottom: "2rem" }}>
          <Link to="/canvas" className="btn btn-primary">
            Start Creating Now
          </Link>
        </div>

        <div className="auth-section">
          <div className="auth-button-group">
            <div className="auth-option">
              <p className="auth-label">New here?</p>
              <Link to="/signup" className="btn btn-signup">
                Sign up
              </Link>
            </div>

            <div className="auth-option">
              <p className="auth-label">Existing User?</p>
              <Link to="/signin" className="btn btn-signin">
                Sign in
              </Link>
            </div>
          </div>

          <div className="or-separator">
            <span>OR</span>
          </div>

          <div id="googleBtn" className="google-button"></div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
