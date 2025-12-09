import "./AdminReports.css";
import { useState, useEffect, useRef } from "react";
import {
  MoreVertical, Eye, Trash2, TriangleAlert, CheckCircle, Loader, FileText,
  ArrowLeft, MapPin, User, Save, X
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminReports({ setCurrentPage }) {
  const API = import.meta.env.VITE_API_URL || "https://ecotrack-backend-n5pv.onrender.com";
  const navigate = useNavigate();

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
  const [modal, setModal] = useState({ isOpen: false, type: "", title: "", message: "", data: null, callback: null });

  const menuRef = useRef(null);
  const filterRef = useRef(null);

  // Inform parent current page (optional, not used for navigation)
  useEffect(() => {
    if (setCurrentPage) setCurrentPage("Reports");
  }, [setCurrentPage]);

  // Click outside handler for menus
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setOpenActionIndex(null);
      if (filterRef.current && !filterRef.current.contains(event.target)) setIsFilterOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Normalize file URLs coming from backend (replace localhost with API origin)
  const normalizeFileUrl = (url) => {
    if (!url) return url;
    try {
      const u = new URL(url);
      // if backend returned localhost path, replace origin
      if (u.hostname === "localhost" || u.hostname === "127.0.0.1") {
        return `${API}/uploads/${u.pathname.split("/").pop()}`;
      }
      return url;
    } catch {
      // if it's a relative path like "/uploads/xxx"
      if (url.startsWith("/")) {
        return `${API}${url}`;
      }
      return url;
    }
  };

  // Fetch reports
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token") || "";
        if (!token) throw new Error("You must be logged in to view reports.");

        const res = await fetch(`${API}/api/admin/reports`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) throw new Error("Unauthorized. Please login again.");
          throw new Error("Failed to fetch reports from server.");
        }
        const data = await res.json();

        // Normalize files and ensure consistent shape
        const mapped = Array.isArray(data)
          ? data.map((r) => ({
              ...r,
              files: Array.isArray(r.files) ? r.files.map(normalizeFileUrl) : [],
            }))
          : [];

        setReports(mapped);
      } catch (err) {
        console.error(err);
        setModal({ isOpen: true, type: "error", title: "Error", message: err.message || "Failed to load reports." });
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [API]);

  // Filtering + search
  const filteredReports = reports.filter((report) => {
    const matchesStatus = filterStatus === "All" || report.status === filterStatus;
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !term ||
      (report.id && report.id.toString().includes(term)) ||
      (report.issue_type && report.issue_type.toLowerCase().includes(term)) ||
      (report.full_name && report.full_name.toLowerCase().includes(term)) ||
      (report.location && report.location.toLowerCase().includes(term));
    return matchesStatus && matchesSearch;
  });

  const toggleMenu = (index, e) => {
    e.stopPropagation();
    setOpenActionIndex(openActionIndex === index ? null : index);
  };

  const toggleFilterMenu = () => setIsFilterOpen(!isFilterOpen);
  const handleFilterSelect = (status) => {
    setFilterStatus(status);
    setIsFilterOpen(false);
  };
  const clearFilter = (e) => {
    e.stopPropagation();
    setFilterStatus("All");
    setIsFilterOpen(false);
  };

  const markAsRead = (id) => {
    if (!readReportIds.includes(id)) {
      const newIds = [...readReportIds, id];
      setReadReportIds(newIds);
      localStorage.setItem("readReports", JSON.stringify(newIds));
    }
  };

  // View details - convert fields to UI-friendly shape
  const handleViewDetails = (report) => {
    markAsRead(report.id);
    setSelectedReport({
      ...report,
      submittedDate: report.created_at ? new Date(report.created_at).toLocaleString() : "N/A",
      photos: Array.isArray(report.files) ? report.files.map(normalizeFileUrl) : [],
      reporter: report.full_name || "Anonymous",
      description: report.description || "No description provided.",
    });
    setStatusToUpdate(report.status || "Pending");
    setOpenActionIndex(null);
  };

  const handleBackToList = () => setSelectedReport(null);

  // Save status update
  const handleSaveChanges = async () => {
    if (!selectedReport) return;
    try {
      const token = localStorage.getItem("token") || "";
      if (!token) throw new Error("Unauthorized.");

      const res = await fetch(`${API}/api/admin/reports/${selectedReport.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: statusToUpdate }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update report.");

      // Update local list + detail view
      setReports((prev) => prev.map((r) => (r.id === selectedReport.id ? { ...r, status: statusToUpdate } : r)));
      setSelectedReport((prev) => ({ ...prev, status: statusToUpdate }));

      setModal({ isOpen: true, type: "success", title: "Updated", message: "Report status has been updated." });
    } catch (err) {
      console.error(err);
      setModal({ isOpen: true, type: "error", title: "Error", message: err.message || "Update failed." });
    }
  };

  // Delete
  const initiateDelete = (reportId) => {
    setModal({
      isOpen: true,
      type: "delete",
      title: "Delete Report?",
      message: "Are you sure you want to permanently delete this report?",
      data: reportId,
    });
    setOpenActionIndex(null);
  };

  const confirmDelete = async () => {
    const reportId = modal.data;
    try {
      const token = localStorage.getItem("token") || "";
      if (!token) throw new Error("Unauthorized.");

      const res = await fetch(`${API}/api/admin/reports/${reportId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete report.");

      setReports((prev) => prev.filter((r) => r.id !== reportId));
      if (selectedReport && selectedReport.id === reportId) setSelectedReport(null);

      setModal({ isOpen: true, type: "success", title: "Deleted", message: "Report was deleted." });
    } catch (err) {
      console.error(err);
      setModal({ isOpen: true, type: "error", title: "Error", message: err.message || "Delete failed." });
    }
  };

  const getStatusIcon = (status) => {
    if (status === "Pending") return <TriangleAlert size={14} />;
    if (status === "In Progress") return <Loader size={14} />;
    if (status === "Resolved") return <CheckCircle size={14} />;
    return <FileText size={14} />;
  };

  const getIssueStyle = (type) => {
    switch (type) {
      case "Missed Collection": return { icon: <CalendarClock size={20} />, styleClass: "blue" };
      case "Illegal Dumping": return { icon: <TriangleAlert size={20} />, styleClass: "red" };
      case "Overflowing Bin": return { icon: <Trash2 size={20} />, styleClass: "gray" };
      case "Damaged Bin": return { icon: <Wrench size={20} />, styleClass: "orange" };
      case "Hazardous Waste": return { icon: <Trash2 size={20} />, styleClass: "red" }; // skull icon if desired
      case "Bulk Pickup Request": return { icon: <Trash2 size={20} />, styleClass: "green" }; // truck icon if desired
      default: return { icon: <FileText size={20} />, styleClass: "gray" };
    }
  };

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
              {modal.type === "delete" ? (
                <>
                  <button className="btn-modal-cancel" onClick={() => setModal({ ...modal, isOpen: false })}>Cancel</button>
                  <button className="btn-modal-delete" onClick={confirmDelete}>Delete</button>
                </>
              ) : (
                <button className="btn-modal-ok" onClick={() => setModal({ ...modal, isOpen: false })}>OK</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Details view */}
      {selectedReport ? (
        <div className="detail-view-mode">
          <div className="detail-top-nav">
            <button onClick={handleBackToList} className="back-button"><ArrowLeft size={18} /> Back to Reports List</button>
          </div>

          <div className="detail-content-card">
            <div className="detail-header">
              <div className="header-left">
                <h1>Report Details #{selectedReport.id}</h1>
                <p className="subtitle">Submitted on {selectedReport.submittedDate}</p>
              </div>
              <div className={`status-badge-lg ${selectedReport.status.toLowerCase().replace(" ", "-")}`}>
                {getStatusIcon(selectedReport.status)} {selectedReport.status}
              </div>
            </div>

            <hr className="divider" />

            <div className="detail-section">
              <h3 className="section-title"><FileText size={20} /> Incident Overview</h3>
              <div className="overview-grid">
                <div className="info-box"><label>ISSUE TYPE</label><div className="info-value big-text">{selectedReport.issue_type}</div></div>
                <div className="info-box"><label>PRIORITY</label><div className="info-value">{selectedReport.priority || "N/A"}</div></div>
                <div className="info-box full-width"><label>LOCATION</label><div className="info-value flex-center"><MapPin size={18} /><span className="location-text">{selectedReport.location}</span></div></div>
              </div>
            </div>

            <div className="detail-section">
              <h3 className="section-title">Description</h3>
              <div className="description-box">{selectedReport.description}</div>
            </div>

            <div className="detail-section">
              <h3 className="section-title">Attached Photos</h3>
              {selectedReport.photos && selectedReport.photos.length > 0 ? (
                <div className="photos-grid">
                  {selectedReport.photos.map((url, i) => (
                    <div key={i} className="photo-frame">
                      <img src={url} alt={`Evidence ${i}`} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray">No photos attached.</p>
              )}
            </div>

            <div className="detail-section">
              <h3 className="section-title"><User size={20} /> Reporter Information</h3>
              <div className="contact-grid">
                <div className="input-group"><label>Full Name</label><input type="text" value={selectedReport.reporter} readOnly /></div>
                <div className="input-group"><label>Phone Number</label><input type="text" value={selectedReport.phone || "N/A"} readOnly /></div>
                <div className="input-group"><label>Email Address</label><input type="text" value={selectedReport.email || "N/A"} readOnly /></div>
              </div>
            </div>

            <div className="detail-footer">
              <div className="footer-left">
                <span className="footer-label">Update Report Status:</span>
                <select className="status-select" value={statusToUpdate} onChange={(e) => setStatusToUpdate(e.target.value)}>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
              <button className="btn-save-light" onClick={handleSaveChanges}><Save size={16} /> Save Changes</button>
            </div>
          </div>
        </div>
      ) : (
        // List view
        <>
          <div className="reports-header">
            <div className="header-text">
              <h1>Reports</h1>
              <p>Manage and review environmental tracking reports</p>
            </div>
          </div>

          <div className="reports-controls">
            <div className="reports-search-wrapper">
              <input type="text" placeholder="Search reports..." className="reports-search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>

            <div className="reports-action-buttons" ref={filterRef} style={{ position: "relative" }}>
              <button className={`btn-secondary ${isFilterOpen || filterStatus !== "All" ? "active-filter" : ""}`} onClick={toggleFilterMenu}>
                <span>Filter</span>
                {filterStatus !== "All" && <span className="clear-filter" onClick={clearFilter}><X size={12} /></span>}
              </button>

              {isFilterOpen && (
                <div className="filter-dropdown-menu">
                  <div className="filter-option" onClick={() => handleFilterSelect("All")}>All Reports</div>
                  <div className="filter-option" onClick={() => handleFilterSelect("Pending")}>Pending</div>
                  <div className="filter-option" onClick={() => handleFilterSelect("In Progress")}>In Progress</div>
                  <div className="filter-option" onClick={() => handleFilterSelect("Resolved")}>Resolved</div>
                </div>
              )}
            </div>
          </div>

          <div className="reports-count">{filterStatus === "All" ? "All Reports" : `Filtering by: ${filterStatus}`} ({filteredReports.length})</div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>REPORT ID</th>
                  <th>REPORT TYPE</th>
                  <th>SUBMITTED BY</th>
                  <th>LOCATION</th>
                  <th>DATE</th>
                  <th>STATUS</th>
                  <th className="text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.length > 0 ? (
                  filteredReports.map((report, idx) => {
                    const { icon } = getIssueStyle(report.issue_type);
                    const isUnread = !readReportIds.includes(report.id);
                    const isLastRow = idx >= filteredReports.length - 2 && filteredReports.length > 2;
                    return (
                      <tr key={report.id} className={isUnread ? "unread-row" : ""}>
                        <td className="font-bold text-dark id-cell">{isUnread && <div className="unread-dot" title="New Report"></div>}{report.id}</td>
                        <td><div className="report-type-wrapper"><div className="report-icon-box">{icon}</div><div><span className="report-title">{report.issue_type}</span></div></div></td>
                        <td className="font-medium text-dark">{report.full_name}</td>
                        <td className="text-gray">{report.location}</td>
                        <td className="text-gray">{report.created_at ? new Date(report.created_at).toLocaleDateString() : "N/A"}</td>
                        <td><span className={`status-badge ${report.status.toLowerCase().replace(" ", "-")}`}>{getStatusIcon(report.status)} {report.status}</span></td>
                        <td className="text-right action-cell">
                          <div className="action-wrapper">
                            <button className={`btn-icon ${openActionIndex === idx ? "active" : ""}`} onClick={(e) => toggleMenu(idx, e)}><MoreVertical size={18} /></button>
                            {openActionIndex === idx && (
                              <div className={`action-menu ${isLastRow ? "menu-up" : ""}`} ref={menuRef} onClick={(e) => e.stopPropagation()}>
                                <button className="menu-item" onClick={() => handleViewDetails(report)}><Eye size={14} /> View Details</button>
                                <div className="menu-divider" />
                                <button className="menu-item delete" onClick={() => initiateDelete(report.id)}><Trash2 size={14} /> Delete</button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr><td colSpan="7" style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>No reports found matching your search or filter.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
