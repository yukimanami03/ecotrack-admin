import "./AdminReports.css";
import { useState, useEffect, useRef } from "react";
import { 
  MoreVertical, Eye, Trash2, TriangleAlert, CheckCircle, Loader, 
  FileText, ArrowLeft, MapPin, User, Save, CalendarClock, Wrench, Truck, Skull, HelpCircle, X
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openActionIndex, setOpenActionIndex] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [statusToUpdate, setStatusToUpdate] = useState("");
  const [readReportIds, setReadReportIds] = useState(() => {
    const saved = localStorage.getItem("readReports");
    return saved ? JSON.parse(saved) : [];
  });
  const [filterStatus, setFilterStatus] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [modal, setModal] = useState({ isOpen: false, type: "", title: "", message: "", data: null });

  const menuRef = useRef(null);
  const filterRef = useRef(null);
  const navigate = useNavigate();

  const API = import.meta.env.VITE_API_URL || "https://ecotrack-backend-n5pv.onrender.com";

  // Click outside for menu/filter
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setOpenActionIndex(null);
      if (filterRef.current && !filterRef.current.contains(event.target)) setIsFilterOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch reports from backend
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token") || "";
        if (!token) throw new Error("No token found, please login.");

        const res = await fetch(`${API}/api/admin/reports`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch reports");
        const data = await res.json();
        setReports(data);
      } catch (err) {
        console.error(err);
        setModal({ isOpen: true, type: "error", title: "Error", message: err.message });
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [API]);

  // Filter/search logic
  const filteredReports = reports.filter((r) => {
    const matchesStatus = filterStatus === "All" || r.status === filterStatus;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (r.id && r.id.toString().includes(term)) ||
      (r.issue_type && r.issue_type.toLowerCase().includes(term)) ||
      (r.full_name && r.full_name.toLowerCase().includes(term)) ||
      (r.location && r.location.toLowerCase().includes(term));
    return matchesStatus && matchesSearch;
  });

  const toggleMenu = (index, e) => { e.stopPropagation(); setOpenActionIndex(openActionIndex === index ? null : index); };
  const toggleFilterMenu = () => setIsFilterOpen(!isFilterOpen);
  const handleFilterSelect = (status) => { setFilterStatus(status); setIsFilterOpen(false); };
  const clearFilter = (e) => { e.stopPropagation(); setFilterStatus("All"); setIsFilterOpen(false); };

  const getIssueStyle = (type) => {
    switch (type) {
      case "Missed Collection": return { icon: <CalendarClock size={20} />, styleClass: "blue" };
      case "Illegal Dumping": return { icon: <TriangleAlert size={20} />, styleClass: "red" };
      case "Overflowing Bin": return { icon: <Trash2 size={20} />, styleClass: "gray" };
      case "Damaged Bin": return { icon: <Wrench size={20} />, styleClass: "orange" };
      case "Hazardous Waste": return { icon: <Skull size={20} />, styleClass: "red" };
      case "Bulk Pickup Request": return { icon: <Truck size={20} />, styleClass: "green" };
      default: return { icon: <HelpCircle size={20} />, styleClass: "gray" };
    }
  };

  const getStatusIcon = (status) => {
    if (status === "Pending") return <TriangleAlert size={14} />;
    if (status === "In Progress") return <Loader size={14} />;
    if (status === "Resolved") return <CheckCircle size={14} />;
    return <FileText size={14} />;
  };

  // View details
  const handleViewDetails = (report) => {
    if (!readReportIds.includes(report.id)) {
      const newReadIds = [...readReportIds, report.id];
      setReadReportIds(newReadIds);
      localStorage.setItem("readReports", JSON.stringify(newReadIds));
    }
    setSelectedReport(report);
    setStatusToUpdate(report.status || "Pending");
    setOpenActionIndex(null);
  };

  const handleBackToList = () => setSelectedReport(null);

  if (loading) return <div className="loading-screen"><Loader className="animate-spin" /> Loading reports...</div>;

  return (
    <div className="reports-page" onClick={() => setOpenActionIndex(null)}>
      {/* Modal */}
      {modal.isOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className={`modal-icon-header ${modal.type}`}>
              {modal.type === "delete" && <Trash2 size={32} />}
              {modal.type === "success" && <CheckCircle size={32} />}
              {modal.type === "error" && <TriangleAlert size={32} />}
            </div>
            <div className="modal-content-body">
              <h3>{modal.title}</h3>
              <p>{modal.message}</p>
            </div>
            <div className="modal-actions">
              <button className="btn-modal-ok" onClick={() => setModal({ ...modal, isOpen: false })}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Selected Report Detail */}
      {selectedReport ? (
        <div className="detail-view-mode">
          <button className="back-button" onClick={handleBackToList}><ArrowLeft size={18} /> Back to Reports</button>
          <h1>Report Details #{selectedReport.id}</h1>
          <p>Type: {selectedReport.issue_type}</p>
          <p>Status: {selectedReport.status}</p>
          <p>Location: {selectedReport.location}</p>
          <p>Description: {selectedReport.description || "No description"}</p>
          <div className="detail-footer">
            <select value={statusToUpdate} onChange={(e) => setStatusToUpdate(e.target.value)}>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
            <button>Save Changes</button>
          </div>
        </div>
      ) : (
        <>
          {/* Reports List */}
          <div className="reports-header">
            <h1>Reports</h1>
            <p>Manage environmental tracking reports</p>
          </div>

          <div className="reports-controls">
            <input placeholder="Search reports..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <button onClick={toggleFilterMenu}>Filter: {filterStatus}</button>
            {isFilterOpen && (
              <div ref={filterRef} className="filter-dropdown-menu">
                <div onClick={() => handleFilterSelect("All")}>All</div>
                <div onClick={() => handleFilterSelect("Pending")}>Pending</div>
                <div onClick={() => handleFilterSelect("In Progress")}>In Progress</div>
                <div onClick={() => handleFilterSelect("Resolved")}>Resolved</div>
              </div>
            )}
          </div>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Submitted By</th>
                <th>Location</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length > 0 ? filteredReports.map((r, idx) => {
                const { icon, styleClass } = getIssueStyle(r.issue_type);
                const isUnread = !readReportIds.includes(r.id);
                return (
                  <tr key={r.id} className={isUnread ? "unread-row" : ""}>
                    <td>{r.id}</td>
                    <td>{icon} {r.issue_type}</td>
                    <td>{r.full_name}</td>
                    <td>{r.location}</td>
                    <td>{r.created_at ? new Date(r.created_at).toLocaleDateString() : "N/A"}</td>
                    <td>{getStatusIcon(r.status)} {r.status}</td>
                    <td>
                      <button onClick={(e) => toggleMenu(idx, e)}>...</button>
                      {openActionIndex === idx && (
                        <div ref={menuRef}>
                          <button onClick={() => handleViewDetails(r)}><Eye /> View</button>
                          <button onClick={() => console.log("Delete")}>Delete</button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              }) : (
                <tr><td colSpan={7}>No reports found</td></tr>
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
