import "./AdminDashboard.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// ... import icons ...

export default function AdminDashboard({ setCurrentPage }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState([]);
  const [incidentReports, setIncidentReports] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    setCurrentPage("Dashboard");
    fetchDashboardData();
  }, [setCurrentPage]);

  const fetchDashboardData = async () => {
    try {
      const reportsRes = await fetch(`${API_URL}/api/admin/reports`);
      const reports = await reportsRes.json();
      setIncidentReports(reports.slice(0, 5));

      const pendingReviews = reports.filter(r => r.status === "Pending").length;

      const usersRes = await fetch(`${API_URL}/api/admin/users`);
      const users = await usersRes.json();
      const activeUsers = users.length;

      setStats([
        { label: "Total Waste Collected", value: "2,405 tons", change: "+12.5%", isPositive: true, icon: <TrashIcon />, colorClass: "bg-green-100" },
        { label: "Recycling Rate", value: "68%", change: "+8.2%", isPositive: true, icon: <LeafIcon />, colorClass: "bg-blue-100" },
        { label: "Active Users", value: activeUsers, change: "+8.2%", isPositive: true, icon: <UserIcon />, colorClass: "bg-orange-100" },
        { label: "Pending Reviews", value: pendingReviews, change: pendingReviews > 0 ? "-5.1%" : "0%", isPositive: pendingReviews === 0, icon: <AlertIcon />, colorClass: "bg-orange-100" },
      ]);

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    }
  };

  // ... rest of the dashboard JSX, charts, tables remain unchanged ...

  return (
    <div className="dashboard-container">
      {/* Dashboard JSX as before */}
    </div>
  );
}
