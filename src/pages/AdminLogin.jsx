import React, { useState } from "react";
import "./AdminLogin.css";

export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (email === "admin@ecotrack.com" && password === "admin123") {
      onLogin();
    } else {
      setError("Invalid credentials. Please try the demo account.");
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-header">
        <div className="brand-container">
          <div className="logo-wrapper">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="32" 
              height="32" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="white" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.77 10-10 10Z" />
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
            </svg>
          </div>
          <h1 className="brand-name">EcoTrack</h1>
        </div>
        <p className="brand-tagline">Environmental Tracking System</p>
      </div>

      <div className="login-card">
        <h2 className="signin-heading">Admin Login</h2>
        <p className="signin-subheading">
          Enter your credentials to access the admin dashboard
        </p>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-alert">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-wrapper">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ecotrack.com"
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="form-input"
                required
              />
            </div>
          </div>

          <button type="submit" className="login-button">
            Sign In
          </button>
        </form>
      </div>

      <footer className="login-footer">
        © 2025 EcoTrack. All rights reserved.
      </footer>
    </div>
  );
}
