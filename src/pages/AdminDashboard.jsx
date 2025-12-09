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
      const reportsRes = await fetch("http://localhost:3000/api/admin/reports");
      const reports = await reportsRes.json();
      setIncidentReports(reports.slice(0, 5));

      const pendingReviews = reports.filter((r) => r.status === "Pending").length;

      const usersRes = await fetch("http://localhost:3000/api/admin/users");
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
  
  const chartData = [
    { day: "Mon", collected: 400, recycled: 240, x: 0,   yCol: 180, yRec: 228 },
    { day: "Tue", collected: 290, recycled: 140, x: 83,  yCol: 213, yRec: 258 }, 
    { day: "Wed", collected: 200, recycled: 980, x: 166, yCol: 240, yRec: 6 },   
    { day: "Thu", collected: 275, recycled: 390, x: 250, yCol: 217, yRec: 183 }, 
    { day: "Fri", collected: 190, recycled: 480, x: 333, yCol: 243, yRec: 156 }, 
    { day: "Sat", collected: 240, recycled: 380, x: 416, yCol: 228, yRec: 186 },
    { day: "Sun", collected: 350, recycled: 430, x: 500, yCol: 195, yRec: 171 },
  ];
  const activeData = activeIndex !== null ? chartData[activeIndex] : null;
  const bluePathD = "M0,228 C41,228 41,258 83,258 S125,6 166,6 S208,183 250,183 S291,156 333,156 S375,186 416,186 S458,171 500,171";
  const greenPathD = "M0,180 C41,180 41,213 83,213 S125,240 166,240 S208,217 250,217 S291,243 333,243 S375,228 416,228 S458,195 500,195";

  const pieData = [
    { name: "Plastic", value: 30, color: "#3b82f6" }, 
    { name: "Paper",   value: 20, color: "#f59e0b" }, 
    { name: "Organic", value: 25, color: "#22c55e" }, 
    { name: "Metal",   value: 15, color: "#64748b" }, 
    { name: "Glass",   value: 10, color: "#a855f7" }, 
  ];
  const radius = 70; 
  const strokeWidth = 40; 
  const circumference = 2 * Math.PI * radius; 
  let accumulatedPercent = 0;

  const getStatusClass = (status) => {
    switch(status) {
      case "Pending": return "status-badge-pending";
      case "In Progress": return "status-badge-progress";
      case "Resolved": return "status-badge-resolved";
      default: return "";
    }
  };

  const handleViewAllClick = () => {
    setCurrentPage("Reports");
    navigate("/reports");
  };

  return (
    <div className="dashboard-container">
      
      <div className="admin-dashboard-header">
        <h2 className="admin-dashboard-title">Dashboard</h2>
        <p className="admin-dashboard-subtitle">
          Welcome back! Here's your environmental tracking overview for Barangay Bulatok, Pagadian City.
        </p>
      </div>

      <div className="stats-grid">
        {stats.map((stat, idx) => (
          <div key={idx} className="stat-card">
            <div className="stat-header">
              <div>
                <p className="stat-label">{stat.label}</p>
                <p className="stat-value">{stat.value}</p>
              </div>
              <div className={`stat-icon-box ${stat.colorClass}`}>
                {stat.icon}
              </div>
            </div>
            <p className={`stat-change ${stat.isPositive ? "positive" : "negative"}`}>
              <span>{stat.isPositive ? "↗" : "↘"}</span>
              {stat.change} <span className="text-muted">vs last month</span>
            </p>
          </div>
        ))}
      </div>

      <div className="charts-grid">
        <div className="chart-card trends-chart">
          <div className="chart-header">
            <h3>Collection Trends</h3>
            <select className="chart-filter">
              <option>This Week</option>
              <option>Last Week</option>
            </select>
          </div>
          <div className="chart-layout">
            <div className="y-axis-labels">
              <span>1000</span><span>750</span><span>500</span><span>250</span><span>0</span>
            </div>
            <div className="chart-body" onMouseLeave={() => setActiveIndex(null)}>
              {activeData && (
                <div className="chart-tooltip-box" style={{ left: `${Math.min(Math.max(activeData.x / 5, 10), 90)}%` }}>
                  <p className="tooltip-title">{activeData.day}</p>
                  <div className="tooltip-row">
                    <div className="row-label"><span className="dot green"></span><span>collected :</span></div>
                    <span className="text-green-bold">{activeData.collected}</span>
                  </div>
                  <div className="tooltip-row">
                    <div className="row-label"><span className="dot blue"></span><span>recycled :</span></div>
                    <span className="text-blue-bold">{activeData.recycled}</span>
                  </div>
                </div>
              )}
              <svg viewBox="0 0 500 315" className="line-chart-svg" preserveAspectRatio="none">
                <defs>
                   <linearGradient id="blueGradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" /><stop offset="100%" stopColor="#3b82f6" stopOpacity="0" /></linearGradient>
                   <linearGradient id="greenGradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#22c55e" stopOpacity="0.1" /><stop offset="100%" stopColor="#22c55e" stopOpacity="0" /></linearGradient>
                </defs>
                <line x1="0" y1="0" x2="500" y2="0" stroke="#f3f4f6" strokeDasharray="4"/>
                <line x1="0" y1="75" x2="500" y2="75" stroke="#f3f4f6" strokeDasharray="4"/>
                <line x1="0" y1="150" x2="500" y2="150" stroke="#f3f4f6" strokeDasharray="4"/>
                <line x1="0" y1="225" x2="500" y2="225" stroke="#f3f4f6" strokeDasharray="4"/>
                <line x1="0" y1="300" x2="500" y2="300" stroke="#f3f4f6" opacity="1"/>
                <path d={`${bluePathD} V 300 H 0 Z`} fill="url(#blueGradient)" />
                <path d={bluePathD} fill="none" stroke="#3b82f6" strokeWidth="2.5" />
                <path d={`${greenPathD} V 300 H 0 Z`} fill="url(#greenGradient)" />
                <path d={greenPathD} fill="none" stroke="#22c55e" strokeWidth="2.5" />
                 {activeData && (
                   <>
                      <line x1={activeData.x} y1="0" x2={activeData.x} y2="300" stroke="#e5e7eb" strokeWidth="2" strokeDasharray="4" />
                      <circle cx={activeData.x} cy={activeData.yCol} r="4" fill="white" stroke="#22c55e" strokeWidth="2" />
                      <circle cx={activeData.x} cy={activeData.yRec} r="4" fill="white" stroke="#3b82f6" strokeWidth="2" />
                   </>
                 )}
                 {chartData.map((data, index) => (
                   <rect key={index} x={index === 0 ? 0 : data.x - 41} y="0" width="83" height="330" fill="transparent" onMouseEnter={() => setActiveIndex(index)} style={{ cursor: 'pointer' }}/>
                 ))}
                {chartData.map((d, i) => (
                  <text key={i} x={d.x} y="315" textAnchor={i === 0 ? "start" : i === 6 ? "end" : "middle"} fill={activeIndex === i ? "#111827" : "#9ca3af"} fontSize="12" fontWeight={activeIndex === i ? "600" : "400"} style={{ transition: "all 0.2s ease", userSelect: "none" }}>{d.day}</text>
                ))}
              </svg>
            </div>
          </div>
        </div>

        <div className="chart-card composition-chart">
          <h3>Waste Composition</h3>
          <div className="donut-container" style={{ position: 'relative', height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className={`donut-label ${hoveredSlice ? "visible" : ""}`}>
              {hoveredSlice && <div className="donut-label-text">{hoveredSlice.name} : {hoveredSlice.value}</div>}
            </div>
            <svg width="200" height="200" viewBox="0 0 200 200" style={{ transform: 'rotate(-90deg)' }}>
              {pieData.map((slice, i) => {
                const segmentLength = (slice.value / 100) * circumference;
                const dashArray = `${segmentLength - 5} ${circumference - (segmentLength - 5)}`;
                const offset = -(accumulatedPercent / 100) * circumference;
                accumulatedPercent += slice.value;
                return <circle key={i} cx="100" cy="100" r={radius} fill="none" stroke={slice.color} strokeWidth={strokeWidth} strokeDasharray={dashArray} strokeDashoffset={offset} strokeLinecap="butt" className="donut-segment" onMouseEnter={() => setHoveredSlice(slice)} onMouseLeave={() => setHoveredSlice(null)} />
              })}
            </svg>
          </div>
          <div className="legend-grid">
             <div className="legend-item"><span className="color-dot purple"></span>Glass</div>
             <div className="legend-item"><span className="color-dot grey"></span>Metal</div>
             <div className="legend-item"><span className="color-dot green"></span>Organic</div>
             <div className="legend-item"><span className="color-dot yellow"></span>Paper</div>
             <div className="legend-item"><span className="color-dot blue"></span>Plastic</div>
          </div>
        </div>
      </div>

      <div className="section-container full-width">
        <div className="section-header-row">
          <h3 className="section-title">Latest Incident Reports</h3>
          <button 
            className="view-all-btn" 
            onClick={handleViewAllClick}
          >
            View All
          </button>
        </div>

        <div className="incidents-table-container">
          <div className="table-header">
            <div className="th-coll">REPORT ID</div>
            <div className="th-col">REPORT TYPE</div>
            <div className="th-cel">SUBMITTED BY</div>
            <div className="th-cel">LOCATION</div>
            <div className="th-cel">DATE</div>
            <div className="th-cel">STATUS</div>
          </div>

          {incidentReports.map((item, idx) => {
            const { icon, styleClass } = getIssueStyle(item.issue_type);
            
            return (
              <div key={idx} className="table-row">
                <div className="td-cell text-id">{item.id}</div>
                
                <div className="td-cell type-cell">
                  <div className={`icon-box bg-${styleClass}-light text-${styleClass}`}>
                     {icon}
                  </div>
                  <div className="report-details">
                    <span className="report-name">{item.issue_type || "Unknown Issue"}</span>
                    <span className="report-subid">ID: {item.id}</span>
                  </div>
                </div>

                <div className="td-cell text-user">{item.full_name || "N/A"}</div>
                <div className="td-cell text-gray">{item.location || "N/A"}</div>
                <div className="td-cell text-gray">{item.created_at?.split("T")[0]}</div>
                <div className="td-cell">
                  <span className={`status-pill ${getStatusClass(item.status)}`}>
                    {item.status === 'Pending' && <StatusPendingIcon />}
                    {item.status === 'In Progress' && <StatusProgressIcon />}
                    {item.status === 'Resolved' && <StatusResolvedIcon />}
                    {!['Pending', 'In Progress', 'Resolved'].includes(item.status) && <StatusProgressIcon />}
                    <span>{item.status}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}