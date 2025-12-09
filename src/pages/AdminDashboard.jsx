import "./AdminDashboard.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  CalendarClock, TriangleAlert, Trash2, Wrench, 
  Skull, Truck, HelpCircle 
} from "lucide-react";

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
);
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);
const LeafIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.77 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
);
const AlertIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
);

const StatusPendingIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
);
const StatusProgressIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);
const StatusResolvedIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);

export default function AdminDashboard({ setCurrentPage }) {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_BACKEND_URL;

  const [stats, setStats] = useState([]);
  const [incidentReports, setIncidentReports] = useState([]);

  const [activeIndex, setActiveIndex] = useState(null);
  const [hoveredSlice, setHoveredSlice] = useState(null);

  useEffect(() => {
    setCurrentPage("Dashboard");
    fetchDashboardData();
  }, [setCurrentPage]);

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
    try {
      const reportsRes = await fetch(`${API_URL}/api/admin/reports`);
      const reports = await reportsRes.json();
      setIncidentReports(reports.slice(0, 5));

      const pendingReviews = reports.filter((r) => r.status === "Pending").length;

      const usersRes = await fetch(`${API_URL}/api/admin/users`);
      const users = await usersRes.json();
      const activeUsers = users.length;

      setStats([
        { 
          label: "Total Waste Collected", 
          value: "2,405 tons", 
          change: "+12.5%", 
          isPositive: true, 
          icon: <TrashIcon />, 
          colorClass: "bg-green-100" 
        },
        { 
          label: "Recycling Rate", 
          value: "68%", 
          change: "+8.2%", 
          isPositive: true, 
          icon: <LeafIcon />, 
          colorClass: "bg-blue-100" 
        },
        { 
          label: "Active Users", 
          value: activeUsers, 
          change: "+8.2%", 
          isPositive: true, 
          icon: <UserIcon />, 
          colorClass: "bg-orange-100" 
        },
        { 
          label: "Pending Reviews", 
          value: pendingReviews, 
          change: pendingReviews > 0 ? "-5.1%" : "0%", 
          isPositive: pendingReviews === 0, 
          icon: <AlertIcon />, 
          colorClass: "bg-orange-100" 
        },
      ]);

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    }
  };

  // ... Keep your chartData, pieData, and rendering logic exactly the same
  // Just replace all "http://localhost:3000" with `${API_URL}` above

  const handleViewAllClick = () => {
    setCurrentPage("Reports");
    navigate("/reports");
  };

  const getStatusClass = (status) => {
    switch(status) {
      case "Pending": return "status-badge-pending";
      case "In Progress": return "status-badge-progress";
      case "Resolved": return "status-badge-resolved";
      default: return "";
    }
  };

  return (
    <div className="dashboard-container">
      {/* Keep all JSX exactly the same */}
      {/* Charts, Stats, Table... */}
      {/* Only API URLs are updated */}
    </div>
  );
}
