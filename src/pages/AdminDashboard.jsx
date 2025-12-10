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

  const API = "https://ecotrack-backend-n5pv.onrender.com"; // Render backend

  useEffect(() => {
    if (setCurrentPage) setCurrentPage("Dashboard");
    fetchDashboardData();
  }, []);

  const getIssueStyle = (type) => {
    if (!type) type = "Other Issue";
    if (type.includes("Missed")) return { icon: <CalendarClock size={20} />, styleClass: "blue" };
    if (type.includes("Illegal")) return { icon: <TriangleAlert size={20} />, styleClass: "red" };
    if (type.includes("Overflowing")) return { icon: <Trash2 size={20} />, styleClass: "gray" };
    if (type.includes("Damaged")) return { icon: <Wrench size={20} />, styleClass: "orange" };
    if (type.includes("Hazardous")) return { icon: <Skull size={20} />, styleClass: "red" };
    if (type.includes("Bulk")) return { icon: <Truck size={20} />, styleClass: "green" };
    return { icon: <HelpCircle size={20} />, styleClass: "gray" };
  };

  const getStatusClass = (status) => status ? status.toLowerCase().replace(" ", "-") : "";

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch Reports
      const reportsRes = await fetch(`${API}/api/admin/reports`);
      if (!reportsRes.ok) throw new Error("Failed to fetch reports");
      const reports = await reportsRes.json();
      setIncidentReports(Array.isArray(reports) ? reports.slice(0, 5) : []);

      const pendingReviews = Array.isArray(reports) ? reports.filter(r => r.status === "Pending").length : 0;

      // Fetch Users
      const usersRes = await fetch(`${API}/api/admin/users`);
      if (!usersRes.ok) throw new Error("Failed to fetch users");
      const users = await usersRes.json();
      const activeUsers = Array.isArray(users) ? users.length : 0;

      setStats([
        { label: "Active Users", value: activeUsers, change: "+8.2%", isPositive: true },
        { label: "Pending Reviews", value: pendingReviews, change: pendingReviews > 0 ? "-5.1%" : "0%", isPositive: pendingReviews === 0 },
        { label: "Total Reports", value: Array.isArray(reports) ? reports.length : 0, change: "+12.5%", isPositive: true },
      ]);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewAllClick = () => navigate("/reports");

  if (loading) return <div className="loading-state">Loading dashboard...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="dashboard-container">
      <h2>Dashboard</h2>

      <div className="stats-grid">
        {stats.map((stat, idx) => (
          <div key={idx} className="stat-card">
            <p className="stat-label">{stat.label}</p>
            <p className="stat-value">{stat.value}</p>
            <p className={`stat-change ${stat.isPositive ? "positive" : "negative"}`}>{stat.change}</p>
          </div>
        ))}
      </div>

      <div className="latest-reports-card">
        <div className="latest-reports-header">
          <h3>Latest Incident Reports</h3>
          <button onClick={handleViewAllClick}>View All</button>
        </div>

        <table className="reports-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {incidentReports.length > 0 ? incidentReports.map((report) => {
              const { icon } = getIssueStyle(report.issue_type || "");
              return (
                <tr key={report.id}>
                  <td>{report.id}</td>
                  <td>{icon} {report.issue_type}</td>
                  <td className={getStatusClass(report.status)}>{report.status}</td>
                </tr>
              );
            }) : (
              <tr><td colSpan="3">No recent reports</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
