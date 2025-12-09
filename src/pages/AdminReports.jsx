import "./AdminDashboard.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarClock, TriangleAlert, Trash2, Wrench, Skull, Truck, HelpCircle, X } from "lucide-react";

// Status icons
const StatusPendingIcon = () => <TriangleAlert size={16} />;
const StatusProgressIcon = () => <svg width="16" height="16" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" /><polyline points="12 6 12 12 16 14" stroke="currentColor" strokeWidth="2" /></svg>;
const StatusResolvedIcon = () => <svg width="16" height="16" viewBox="0 0 24 24"><polyline points="22 4 12 14.01 9 11.01" stroke="currentColor" strokeWidth="2" fill="none" /></svg>;

// Stats icons
const TrashIcon = () => <Trash2 />;
const LeafIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.77 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>;
const UserIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>;
const AlertIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;

export default function AdminDashboard({ setCurrentPage }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState([]);
  const [incidentReports, setIncidentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeReport, setActiveReport] = useState(null);

  // Use deployed backend
  const API = import.meta.env.VITE_API_URL || "https://ecotrack-backend-n5pv.onrender.com";

  useEffect(() => {
    if (setCurrentPage) setCurrentPage("Dashboard");
    fetchDashboardData();
  }, []);

  const getIssueStyle = (type) => {
    switch(type) {
      case "Missed Collection": return { icon: <CalendarClock size={20} />, styleClass: "blue" };
      case "Illegal Dumping": return { icon: <TriangleAlert size={20} />, styleClass: "red" };
      case "Overflowing Bin": return { icon: <Trash2 size={20} />, styleClass: "gray" };
      case "Damaged Bin": return { icon: <Wrench size={20} />, styleClass: "orange" };
      case "Hazardous Waste": return { icon: <Skull size={20} />, styleClass: "red" };
      case "Bulk Pickup Request": return { icon: <Truck size={20} />, styleClass: "green" };
      default: return { icon: <HelpCircle size={20} />, styleClass: "gray" };
    }
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
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found, please login.");

      const reportsRes = await fetch(`${API}/api/admin/reports`, { headers: { Authorization: `Bearer ${token}` }});
      if (!reportsRes.ok) throw new Error("Failed to fetch reports");
      const reports = await reportsRes.json();
      setIncidentReports(reports.slice(0,5));
      const pendingReviews = reports.filter(r => r.status === "Pending").length;

      const usersRes = await fetch(`${API}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` }});
      if (!usersRes.ok) throw new Error("Failed to fetch users");
      const users = await usersRes.json();
      const activeUsers = Array.isArray(users) ? users.length : 0;

      setStats([
        { label: "Total Waste Collected", value: "2,405 tons", change: "+12.5%", isPositive: true, icon: <TrashIcon />, colorClass: "bg-green-100" },
        { label: "Recycling Rate", value: "68%", change: "+8.2%", isPositive: true, icon: <LeafIcon />, colorClass: "bg-blue-100" },
        { label: "Active Users", value: activeUsers, change: "+8.2%", isPositive: true, icon: <UserIcon />, colorClass: "bg-orange-100" },
        { label: "Pending Reviews", value: pendingReviews, change: pendingReviews > 0 ? "-5.1%" : "0%", isPositive: pendingReviews === 0, icon: <AlertIcon />, colorClass: "bg-orange-100" },
      ]);

    } catch(err) {
      console.error(err);
      setError(err.message || "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewAllClick = () => {
    if (setCurrentPage) setCurrentPage("Reports");
    navigate("/reports");
  };

  const openReportModal = (report) => setActiveReport(report);
  const closeReportModal = () => setActiveReport(null);

  if (loading) return <div className="loading-state">Loading dashboard...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="dashboard-container">
      <h2>Dashboard</h2>
      <div className="stats-grid">
        {stats.map((stat, idx) => (
          <div key={idx} className="stat-card">
            <div className="stat-icon">{stat.icon}</div>
            <p>{stat.label}</p>
            <p>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="latest-reports-card">
        <h3>Latest Incident Reports</h3>
        <button onClick={handleViewAllClick}>View All</button>
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Type</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {incidentReports.map(r => {
              const { icon, styleClass } = getIssueStyle(r.type);
              return (
                <tr key={r._id} onClick={() => openReportModal(r)}>
                  <td>{r._id.slice(-6)}</td>
                  <td>{icon} {r.type}</td>
                  <td className={getStatusClass(r.status)}>{r.status}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {activeReport && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Report Details</h3>
            <p><strong>ID:</strong> {activeReport._id}</p>
            <p><strong>Type:</strong> {activeReport.type}</p>
            <p><strong>Status:</strong> {activeReport.status}</p>
            <button onClick={closeReportModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
