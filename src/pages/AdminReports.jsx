import "./AdminReports.css";
import { useState, useEffect, useRef } from "react";
import {
  MoreVertical, Search, Filter, Eye, Trash2,
  TriangleAlert, CheckCircle, Loader, FileText,
  ArrowLeft, MapPin, User, Save, CalendarClock,
  Wrench, Truck, Skull, HelpCircle, X
} from "lucide-react";

export default function AdminReports({ setCurrentPage }) {
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

  const API = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const token = localStorage.getItem("token") || "";

  // ------------------ FETCH DATA ------------------
  useEffect(() => {
    if (setCurrentPage) setCurrentPage("Reports");

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setOpenActionIndex(null);
      if (filterRef.current && !filterRef.current.contains(event.target)) setIsFilterOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);

    const fetchReports = async () => {
      try {
        const res = await fetch(`${API}/api/admin/reports`, {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });
        const data = await res.json();
        setReports(data);
      } catch (err) {
        console.error("Failed to fetch reports:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ------------------ FILTER & SEARCH ------------------
  const toggleFilterMenu = () => setIsFilterOpen(!isFilterOpen);
  const handleFilterSelect = (status) => { setFilterStatus(status); setIsFilterOpen(false); };
  const clearFilter = (e) => { e.stopPropagation(); setFilterStatus("All"); setIsFilterOpen(false); };

  const filteredReports = reports.filter((report) => {
    const matchesStatus = filterStatus === "All" || report.status === filterStatus;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      (report.id && report.id.toString().includes(searchLower)) ||
      (report.issue_type && report.issue_type.toLowerCase().includes(searchLower)) ||
      (report.full_name && report.full_name.toLowerCase().includes(searchLower)) ||
      (report.location && report.location.toLowerCase().includes(searchLower));
    return matchesStatus && matchesSearch;
  });

  // ------------------ MENU & ACTIONS ------------------
  const toggleMenu = (index, e) => { e.stopPropagation(); setOpenActionIndex(openActionIndex === index ? null : index); };

  const handleViewDetails = (report) => {
    if (!readReportIds.includes(report.id)) {
      const newReadIds = [...readReportIds, report.id];
      setReadReportIds(newReadIds);
      localStorage.setItem("readReports", JSON.stringify(newReadIds));
    }
    setSelectedReport({
      ...report,
      submittedDate: report.created_at ? new Date(report.created_at).toLocaleDateString() : "N/A",
      description: report.description || "No description provided.",
      priority: report.priority || "Low",
      photos: report.files || [],
      reporter: report.full_name || "Anonymous",
      email: report.email || "N/A",
      phone: report.phone || "N/A",
    });
    setStatusToUpdate(report.status || "Pending");
    setOpenActionIndex(null);
  };
  const handleBackToList = () => setSelectedReport(null);

  // ------------------ MODAL ------------------
  const closeModal = () => setModal({ ...modal, isOpen: false });

  const handleSaveChanges = async () => {
    try {
      const res = await fetch(`${API}/api/admin/reports/${selectedReport.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : "" },
        body: JSON.stringify({ status: statusToUpdate }),
      });
      const data = await res.json();
      if (res.ok) {
        setReports(prev => prev.map(r => r.id === selectedReport.id ? { ...r, status: statusToUpdate } : r));
        setSelectedReport(prev => ({ ...prev, status: statusToUpdate }));
        setModal({ isOpen: true, type: "success", title: "Status Updated", message: "The report status has been successfully updated." });
      } else {
        setModal({ isOpen: true, type: "error", title: "Update Failed", message: data.message || "Could not update status." });
      }
    } catch (err) {
      setModal({ isOpen: true, type: "error", title: "Error", message: err.message });
    }
  };

  const initiateDelete = (reportId) => {
    setModal({
      isOpen: true, type: "delete", title: "Delete Report?", 
      message: "Are you sure you want to delete this report? This action cannot be undone.", data: reportId
    });
    setOpenActionIndex(null);
  };

  const confirmDelete = async () => {
    const reportId = modal.data;
    try {
      const res = await fetch(`${API}/api/admin/reports/${reportId}`, {
        method: "DELETE", headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      const data = await res.json();
      if (res.ok) {
        setReports(prev => prev.filter(r => r.id !== reportId));
        setModal({ isOpen: true, type: "success", title: "Deleted", message: "The report has been permanently deleted." });
      } else {
        setModal({ isOpen: true, type: "error", title: "Failed", message: data.message || "Could not delete report." });
      }
    } catch (err) {
      setModal({ isOpen: true, type: "error", title: "Error", message: err.message });
    }
  };

  // ------------------ UTILITY ICONS ------------------
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
      case "Hazardous Waste": return { icon: <Skull size={20} />, styleClass: "red" };
      case "Bulk Pickup Request": return { icon: <Truck size={20} />, styleClass: "green" };
      default: return { icon: <HelpCircle size={20} />, styleClass: "gray" };
    }
  };

  if (loading) return <div className="loading-screen"><Loader className="animate-spin" /> Loading reports...</div>;

  // ------------------ RENDER ------------------
  return (
    <div className="reports-page" onClick={() => setOpenActionIndex(null)}>

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
                  <button className="btn-modal-cancel" onClick={closeModal}>Cancel</button>
                  <button className="btn-modal-delete" onClick={confirmDelete}>Delete</button>
                </>
              ) : <button className="btn-modal-ok" onClick={closeModal}>OK</button>}
            </div>
          </div>
        </div>
      )}

      {selectedReport ? (
        <ReportDetail
          report={selectedReport}
          statusToUpdate={statusToUpdate}
          setStatusToUpdate={setStatusToUpdate}
          handleBack={handleBackToList}
          handleSaveChanges={handleSaveChanges}
          getStatusIcon={getStatusIcon}
        />
      ) : (
        <ReportList
          reports={filteredReports}
          openActionIndex={openActionIndex}
          toggleMenu={toggleMenu}
          menuRef={menuRef}
          handleViewDetails={handleViewDetails}
          initiateDelete={initiateDelete}
          readReportIds={readReportIds}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterStatus={filterStatus}
          isFilterOpen={isFilterOpen}
          toggleFilterMenu={toggleFilterMenu}
          handleFilterSelect={handleFilterSelect}
          clearFilter={clearFilter}
          getIssueStyle={getIssueStyle}
          getStatusIcon={getStatusIcon}
        />
      )}
    </div>
  );
}

// ------------------ COMPONENTS ------------------
// Split detail and list views for clarity
function ReportDetail({ report, statusToUpdate, setStatusToUpdate, handleBack, handleSaveChanges, getStatusIcon }) {
  return (
    <div className="detail-view-mode">
      <div className="detail-top-nav">
        <button onClick={handleBack} className="back-button"><ArrowLeft size={18} /> Back to Reports List</button>
      </div>
      <div className="detail-content-card">
        <div className="detail-header">
          <div className="header-left">
            <h1>Report Details #{report.id}</h1>
            <p className="subtitle">Submitted on {report.submittedDate}</p>
          </div>
          <div className={`status-badge-lg ${report.status.toLowerCase().replace(" ", "-")}`}>
            {getStatusIcon(report.status)} {report.status}
          </div>
        </div>
        <hr className="divider" />
        <div className="detail-section">
          <h3 className="section-title text-blue" style={{ marginTop: '24px' }}><FileText size={20} /> Incident Overview</h3>
          <div className="overview-grid">
            <div className="info-box"><label>ISSUE TYPE</label><div className="info-value big-text">{report.issue_type}</div></div>
            <div className="info-box"><label>PRIORITY LEVEL</label><div className={`priority-badge ${report.priority.toLowerCase()}`}><TriangleAlert size={14} /> {report.priority}</div></div>
            <div className="info-box full-width"><label>LOCATION</label><div className="info-value flex-center"><MapPin size={18} /><span>{report.location}</span></div></div>
          </div>
        </div>
        <div className="detail-section">
          <h3 className="section-title">Description</h3>
          <div className="description-box">{report.description}</div>
        </div>
        <div className="detail-section">
          <h3 className="section-title">Attached Photos</h3>
          {report.photos.length > 0 ? (
            <div className="photos-grid">{report.photos.map((url,i)=><div key={i} className="photo-frame"><img src={url} alt={`Evidence ${i}`} /></div>)}</div>
          ) : (<p className="text-gray">No photos attached.</p>)}
        </div>
        <div className="detail-section">
          <h3 className="section-title"><User size={20} /> Reporter Information</h3>
          <div className="contact-grid">
            <div className="input-group"><label>Full Name</label><input type="text" value={report.reporter} readOnly /></div>
            <div className="input-group"><label>Phone Number</label><input type="text" value={report.phone} readOnly /></div>
            <div className="input-group"><label>Email Address</label><input type="text" value={report.email} readOnly /></div>
          </div>
        </div>
        <div className="detail-footer">
          <div className="footer-left">
            <span className="footer-label">Update Report Status:</span>
            <select className="status-select" value={statusToUpdate} onChange={e=>setStatusToUpdate(e.target.value)}>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
          <button className="btn-save-light" onClick={handleSaveChanges}><Save size={16} /> Save Changes</button>
        </div>
      </div>
    </div>
  );
}

function ReportList({
  reports, openActionIndex, toggleMenu, menuRef, handleViewDetails, initiateDelete,
  readReportIds, searchTerm, setSearchTerm, filterStatus, isFilterOpen, toggleFilterMenu,
  handleFilterSelect, clearFilter, getIssueStyle, getStatusIcon
}) {
  return (
    <>
      <div className="reports-header">
        <div className="header-text"><h1>Reports</h1><p>Manage and review environmental tracking reports</p></div>
      </div>

      <div className="reports-controls">
        <div className="reports-search-wrapper">
          <Search className="reports-search-icon" size={18} />
          <input type="text" placeholder="Search reports..." className="reports-search-input" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>

        <div className="reports-action-buttons" ref={filterRef} style={{position: "relative"}}>
          <button className={`btn-secondary ${isFilterOpen || filterStatus !== "All" ? "active-filter" : ""}`} onClick={toggleFilterMenu}>
            <Filter size={16} /> {filterStatus === "All" ? "Filter" : filterStatus}
            {filterStatus !== "All" && (<span className="clear-filter" onClick={clearFilter}><X size={12} /></span>)}
          </button>
          {isFilterOpen && (
            <div className="filter-dropdown-menu">
              <div className="filter-option" onClick={() => handleFilterSelect("All")}>All Reports</div>
              <div className="filter-option" onClick={() => handleFilterSelect("Pending")}><TriangleAlert size={14} /> Pending</div>
              <div className="filter-option" onClick={() => handleFilterSelect("In Progress")}><Loader size={14} /> In Progress</div>
              <div className="filter-option" onClick={() => handleFilterSelect("Resolved")}><CheckCircle size={14} /> Resolved</div>
            </div>
          )}
        </div>
      </div>

      <div className="reports-count">{filterStatus === "All" ? "All Reports" : `Filtering by: ${filterStatus}`} ({reports.length})</div>

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
            {reports.length > 0 ? reports.map((report, idx) => {
              const { icon, styleClass } = getIssueStyle(report.issue_type);
              const isUnread = !readReportIds.includes(report.id);
              return (
                <tr key={report.id} className={isUnread ? "unread-row" : ""}>
                  <td className="font-bold text-dark id-cell">{isUnread && <div className="unread-dot" title="New Report"></div>}{report.id}</td>
                  <td><div className="report-type-wrapper"><div className={`report-icon-box bg-${styleClass}-light text-${styleClass}`}>{icon}</div><div><span className="report-title">{report.issue_type}</span></div></div></td>
                  <td className="font-medium text-dark">{report.full_name}</td>
                  <td className="text-gray">{report.location}</td>
                  <td className="text-gray">{report.created_at ? new Date(report.created_at).toLocaleDateString() : "N/A"}</td>
                  <td><span className={`status-badge ${report.status.toLowerCase().replace(" ", "-")}`}>{getStatusIcon(report.status)} {report.status}</span></td>
                  <td className="text-right action-cell">
                    <div className="action-wrapper">
                      <button className={`btn-icon ${openActionIndex === idx ? "active" : ""}`} onClick={(e)=>toggleMenu(idx,e)}><MoreVertical size={18} /></button>
                      {openActionIndex === idx && (
                        <div className="action-menu" ref={menuRef}>
                          <button className="menu-item" onClick={()=>handleViewDetails(report)}><Eye size={14} /> View Details</button>
                          <div className="menu-divider"></div>
                          <button className="menu-item delete" onClick={()=>initiateDelete(report.id)}><Trash2 size={14} /> Delete</button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )
            }) : <tr><td colSpan="7" style={{textAlign:"center", padding:"40px", color:"#6b7280"}}>No reports found matching your search or filter.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
