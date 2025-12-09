import "./AdminDashboard.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  CalendarClock, TriangleAlert, Trash2, Wrench, 
  Skull, Truck, HelpCircle, X 
} from "lucide-react";

// Status icons
const StatusPendingIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const StatusProgressIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const StatusResolvedIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;

// Stats icons
const TrashIcon = () => <Trash2 />;
const LeafIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.77 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>;
const AlertIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState([]);
  const [incidentReports, setIncidentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeReport, setActiveReport] = useState(null);

  const API = import.meta.env.VITE_API_URL || "https://ecotrack-backend-n5pv.onrender.com";

  useEffect(() => {
    fetchDashboardData();
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

  const getStatusClass = (status) => {
    switch(status) {
      case "Pending": return "status-badge-pending";
      case "In Progress": return "status-badge-progress";
      case "Resolved": return "status-badge-resolved";
      default: return "";
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token") || "";
      if (!token) throw new Error("No token found, please login.");

      // Reports
      const reportsRes = await fetch(`${API}/api/admin/reports`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!reportsRes.ok) throw new Error("Failed to fetch reports");
      const reports = await reportsRes.json();
      setIncidentReports(reports.slice(0, 5));
      const pendingReviews = reports.filter(r => r.status === "Pending").length;

      // Users
      const usersRes = await fetch(`${API}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!usersRes.ok) throw new Error("Failed to fetch users");
      const users = await usersRes.json();
      const activeUsers = Array.isArray(users) ? users.length : 0;

      setStats([
        { label: "Total Waste Collected", value: "2,405 tons", change: "+12.5%", isPositive: true, icon: <TrashIcon />, colorClass: "bg-green-100" },
        { label: "Recycling Rate", value: "68%", change: "+8.2%", isPositive: true, icon: <LeafIcon />, colorClass: "bg-blue-100" },
        { label: "Active Users", value: activeUsers, change: "+8.2%", isPositive: true, icon: <UserIcon />, colorClass: "bg-orange-100" },
        { label: "Pending Reviews", value: pendingReviews, change: pendingReviews > 0 ? "-5.1%" : "0%", isPositive: pendingReviews === 0, icon: <AlertIcon />, colorClass: "bg-orange-100" },
      ]);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewAllClick = () => {
    navigate("/reports"); // Only use navigate, do NOT call setCurrentPage here
  };

  const openReportModal = (report) => setActiveReport(report);
  const closeReportModal = () => setActiveReport(null);

  if (loading) return <div className="loading-state">Loading dashboard...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="dashboard-container">
      <div className="admin-dashboard-header">
        <h2 className="admin-dashboard-title">Dashboard</h2>
        <p className="admin-dashboard-subtitle">Welcome back! Here's your environmental tracking overview.</p>
      </div>

      {/* Stats grid */}
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

      {/* Latest Incident Reports */}
      <div className="latest-reports-card">
        <div className="latest-reports-header">
          <h3>Latest Incident Reports</h3>
          <button className="view-all-btn" onClick={handleViewAllClick}>View All</button>
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
            {incidentReports.map((report) => {
              const { icon, styleClass } = getIssueStyle(report.type);
              return (
                <tr key={report._id} style={{ cursor: "pointer" }} onClick={() => openReportModal(report)}>
                  <td>{report._id.slice(-6)}</td>
                  <td className={`report-type ${styleClass}`}>{icon} {report.type}</td>
                  <td className={getStatusClass(report.status)}>
                    {report.status === "Pending" ? <StatusPendingIcon /> : report.status === "In Progress" ? <StatusProgressIcon /> : <StatusResolvedIcon />}
                    {report.status}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Report Modal */}
      {activeReport && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Report Details</h3>
              <button onClick={closeReportModal}><X /></button>
            </div>
            <div className="modal-body">
              <p><strong>ID:</strong> {activeReport._id}</p>
              <p><strong>Type:</strong> {activeReport.type}</p>
              <p><strong>Reporter:</strong> {activeReport.full_name || "Anonymous"}</p>
              <p><strong>Location:</strong> {activeReport.location || "N/A"}</p>
              <p><strong>Status:</strong> {activeReport.status}</p>
              <p><strong>Created At:</strong> {new Date(activeReport.created_at).toLocaleString()}</p>
              <p><strong>Description:</strong> {activeReport.description || "No description"}</p>
            </div>
            <div className="modal-footer">
              <button onClick={closeReportModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
