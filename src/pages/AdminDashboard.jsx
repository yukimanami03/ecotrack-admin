import "./AdminDashboard.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarClock, TriangleAlert, Trash2, Wrench, Skull, Truck, HelpCircle } from "lucide-react";

export default function AdminDashboard({ setCurrentPage }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState([]);
  const [incidentReports, setIncidentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API = import.meta.env.VITE_API_URL || "https://ecotrack-backend-n5pv.onrender.com";

  useEffect(() => {
    if (setCurrentPage) setCurrentPage("Dashboard");
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getIssueStyle = (type) => {
    const safeType = type || "Other Issue";
    if (safeType.includes("Missed")) return { icon: <CalendarClock size={20} />, styleClass: "blue" };
    if (safeType.includes("Illegal")) return { icon: <TriangleAlert size={20} />, styleClass: "red" };
    if (safeType.includes("Overflowing")) return { icon: <Trash2 size={20} />, styleClass: "gray" };
    if (safeType.includes("Damaged")) return { icon: <Wrench size={20} />, styleClass: "orange" };
    if (safeType.includes("Hazardous")) return { icon: <Skull size={20} />, styleClass: "red" };
    if (safeType.includes("Bulk")) return { icon: <Truck size={20} />, styleClass: "green" };
    return { icon: <HelpCircle size={20} />, styleClass: "gray" };
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token") || "";
      if (!token) throw new Error("No token found, please login.");

      // Fetch Reports
      const reportsRes = await fetch(`${API}/api/admin/reports`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!reportsRes.ok) throw new Error("Failed to fetch reports");
      const reports = await reportsRes.json();
      // normalize files (replace localhost urls if any)
      const normalized = (Array.isArray(reports) ? reports : []).map(r => ({
        ...r,
        files: Array.isArray(r.files) ? r.files.map((url) => {
          try {
            const u = new URL(url);
            if (u.hostname === "localhost" || u.hostname === "127.0.0.1") {
              return `${API}/uploads/${u.pathname.split("/").pop()}`;
            }
            return url;
          } catch {
            return url.startsWith("/") ? `${API}${url}` : url;
          }
        }) : []
      }));
      setIncidentReports(normalized.slice(0, 5));
      const pendingReviews = normalized.filter(r => r.status === "Pending").length;

      // Fetch Users
      const usersRes = await fetch(`${API}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!usersRes.ok) throw new Error("Failed to fetch users");
      const users = await usersRes.json();
      const activeUsers = Array.isArray(users) ? users.length : 0;

      setStats([
        { label: "Total Waste Collected", value: "2,405 tons", change: "+12.5%", isPositive: true, icon: <Trash2 />, colorClass: "bg-green-100" },
        { label: "Recycling Rate", value: "68%", change: "+8.2%", isPositive: true, icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.77 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>, colorClass: "bg-blue-100" },
        { label: "Active Users", value: activeUsers, change: "+8.2%", isPositive: true, icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>, colorClass: "bg-orange-100" },
        { label: "Pending Reviews", value: pendingReviews, change: pendingReviews > 0 ? "-5.1%" : "0%", isPositive: pendingReviews === 0, icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>, colorClass: "bg-orange-100" },
      ]);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.message || "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewAllClick = () => {
    // prefer router navigation only
    navigate("/reports");
  };

  if (loading) return <div className="loading-state">Loading dashboard...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="dashboard-container">
      <div className="admin-dashboard-header">
        <h2 className="admin-dashboard-title">Dashboard</h2>
        <p className="admin-dashboard-subtitle">Welcome back! Here's your environmental tracking overview.</p>
      </div>

      <div className="stats-grid">
        {stats.map((stat, idx) => (
          <div key={idx} className="stat-card">
            <div className="stat-header">
              <div>
                <p className="stat-label">{stat.label}</p>
                <p className="stat-value">{stat.value}</p>
              </div>
              <div className={`stat-icon-box ${stat.colorClass}`}>{stat.icon}</div>
            </div>
            <p className={`stat-change ${stat.isPositive ? "positive" : "negative"}`}>
              <span>{stat.isPositive ? "↗" : "↘"}</span>
              {stat.change} <span className="text-muted">vs last month</span>
            </p>
          </div>
        ))}
      </div>

      <div className="latest-reports-card">
        <div className="latest-reports-header">
          <h3>Latest Incident Reports</h3>
          <button className="view-all-btn" onClick={handleViewAllClick}>View All</button>
        </div>

        <table className="reports-table">
          <thead>
            <tr><th>ID</th><th>Type</th><th>Status</th></tr>
          </thead>
          <tbody>
            {incidentReports.map((report) => {
              const { icon } = getIssueStyle(report.issue_type || report.type || "");
              return (
                <tr key={report.id} style={{ cursor: "pointer" }}>
                  <td>{String(report.id).slice(-6)}</td>
                  <td className={`report-type`}>{icon} {report.issue_type || report.type}</td>
                  <td className={getStatusClass(report.status)}>{report.status}</td>
                </tr>
              );
            })}
            {incidentReports.length === 0 && <tr><td colSpan="3">No recent reports</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
