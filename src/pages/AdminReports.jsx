import "./AdminReports.css";
import { useState, useEffect, useRef } from "react";
import {
  MoreVertical, Search, Filter, Eye, Trash2, 
  TriangleAlert, CheckCircle, Loader, FileText,
  ArrowLeft, MapPin, User, Save,
  CalendarClock, Wrench, Truck, Skull, HelpCircle, X
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
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (setCurrentPage) setCurrentPage("Reports");
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setOpenActionIndex(null);
      if (filterRef.current && !filterRef.current.contains(event.target)) setIsFilterOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setCurrentPage]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/reports`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setReports(data || []);
      } catch (err) {
        console.error("Failed to fetch reports:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

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
  const closeModal = () => setModal({ ...modal, isOpen: false });

  const handleSaveChanges = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/reports/${selectedReport.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: statusToUpdate }),
      });
      const data = await res.json();
      if (res.ok) {
        setReports(prev => prev.map(r => r.id === selectedReport.id ? { ...r, status: statusToUpdate } : r));
        setSelectedReport(prev => ({ ...prev, status: statusToUpdate }));
        setModal({ isOpen: true, type: "success", title: "Status Updated", message: "Report status successfully updated." });
      } else {
        setModal({ isOpen: true, type: "error", title: "Update Failed", message: data.message || "Could not update status." });
      }
    } catch (err) {
      setModal({ isOpen: true, type: "error", title: "Error", message: err.message });
    }
  };

  const initiateDelete = (reportId) => {
    setModal({
      isOpen: true,
      type: "delete",
      title: "Delete Report?",
      message: "Are you sure you want to delete this report? This action cannot be undone.",
      data: reportId,
    });
    setOpenActionIndex(null);
  };

  const confirmDelete = async () => {
    const reportId = modal.data;
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/reports/${reportId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setReports(prev => prev.filter(r => r.id !== reportId));
        setModal({ isOpen: true, type: "success", title: "Deleted", message: "Report successfully deleted." });
      } else {
        setModal({ isOpen: true, type: "error", title: "Failed", message: data.message || "Could not delete report." });
      }
    } catch (err) {
      setModal({ isOpen: true, type: "error", title: "Error", message: err.message });
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
      case "Hazardous Waste": return { icon: <Skull size={20} />, styleClass: "red" };
      case "Bulk Pickup Request": return { icon: <Truck size={20} />, styleClass: "green" };
      default: return { icon: <HelpCircle size={20} />, styleClass: "gray" };
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
                  <button className="btn-modal-cancel" onClick={closeModal}>Cancel</button>
                  <button className="btn-modal-delete" onClick={confirmDelete}>Delete</button>
                </>
              ) : (
                <button className="btn-modal-ok" onClick={closeModal}>OK</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Detail View */}
      {selectedReport ? (
        <div className="detail-view-mode">
          <div className="detail-top-nav">
            <button onClick={handleBackToList} className="back-button">
              <ArrowLeft size={18} /> Back to Reports List
            </button>
          </div>
          {/* Detail content code remains same */}
          {/* ... */}
        </div>
      ) : (
        <>
          {/* Reports Table & Controls */}
          {/* ... (your existing search, filter, table code) */}
        </>
      )}
    </div>
  );
}
