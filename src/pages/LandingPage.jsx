import React from "react";
import "./LandingPage.css";

const LandingPage = ({ onNavigate }) => {
  return (
    <div className="landing-container">
      <div className="landing-card">
        <div className="main-icon-wrapper">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </div>

        <h1 className="landing-title">Waste Management System</h1>
        <p className="landing-description">
          Comprehensive solution for managing waste collection, reports, and
          schedules
        </p>

        <div className="features-grid">
          <div className="feature-box box-green">
            <h3>Track Reports</h3>
            <p>Monitor and manage waste collection reports in real-time</p>
          </div>

          <div className="feature-box box-blue">
            <h3>Manage Users</h3>
            <p>Control user access and roles efficiently</p>
          </div>

          <div className="feature-box box-purple">
            <h3>Schedule Collections</h3>
            <p>Plan and organize waste collection schedules</p>
          </div>

          <div className="feature-box box-orange">
            <h3>System Settings</h3>
            <p>Configure and customize system preferences</p>
          </div>
        </div>

        <button className="access-btn" onClick={onNavigate}>
          Access Admin Dashboard
          <span className="arrow-icon">→</span>
        </button>

        <p className="demo-credentials">
          admin@ecotrack.com / admin123
        </p>
      </div>
    </div>
  );
};

export default LandingPage;
