import "./AdminReports.css";
import { useEffect, useState, useRef } from "react";
import { MoreVertical, Search, Filter, Trash2, Loader2, X } from "lucide-react";

export default function AdminReports({ setCurrentPage }) {
  const API = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const token = localStorage.getItem("token") || "";

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [activeActionId, setActiveActionId] = useState(null);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const dropdownRef = useRef(null);
  const filterRef = useRef(null);

  useEffect(() => {
    if (setCurrentPage) setCurrentPage("Reports");
  }, [setCurrentPage]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch(`${API}/api/admin/reports`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error("Failed to fetch reports");
        const data = await res.json();

        const formattedReports = data.map((r) => ({
          id: r.id,
          issue_type: r.issue_type || "Unknown",
          full_name: r.full_name || "Anonymous",
          location: r.location || "N/A",
          status: r.status || "Pending",
          created_at: r.created_at,
        }));

        setReports(formattedReports);
      } catch (err) {
        console.error(err);
        setError("Failed to load reports. Check your connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [API, token]);

  // Delete report
  const confirmDelete = async () => {
    if (!reportToDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`${API}/api/admin/reports/${reportToDelete.id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to delete report");

      setReports((prev) => prev.filter((r) => r.id !== reportToDelete.id));
      setReportToDelete(null);
      setActiveActionId(null);
    } catch (err) {
      console.error(err);
      alert("Something went wrong while deleting the report.");
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setActiveActionId(null);
      if (filterRef.current && !filterRef.current.contains(event.target)) setShowFilterMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleActionMenu = (id) => setActiveActionId(activeActionId === id ? null : id);
  const initiateDelete = (report) => setReportToDelete(report);

  const filteredReports = reports.filter((r) => {
    const matchesSearch = r.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || r.issue_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "All" || r.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const resetFilters = () => {
    setSearchTerm("");
    setFilterStatus("All");
    setShowFilterMenu(false);
  };

  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="reports-container">
      <div className="page-header">
        <h1>Reports</h1>
        <p>Manage and review environmental reports</p>
      </div>

      <div className="controls-bar">
        <div className="search-wrapper">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search by reporter or issue..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && <button onClick={() => setSearchTerm("")}><X size={14} /></button>}
        </div>

        <div className="filter-wrapper" ref={filterRef}>
          <button onClick={() => setShowFilterMenu(!showFilterMenu)} className={showFilterMenu || filterStatus !== "All" ? "active" : ""}>
            <Filter size={18} /> Filters
          </button>

          {showFilterMenu && (
            <div className="filter-menu">
              {["All", "Pending", "In Progress", "Resolved"].map((status) => (
                <button key={status} className={filterStatus === status ? "selected" : ""} onClick={() => setFilterStatus(status)}>
                  {status}
                </button>
              ))}
              <button className="reset-filters" onClick={resetFilters}>Reset</button>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="loading-state"><Loader2 className="animate-spin" size={32} /> Loading reports...</div>
      ) : filteredReports.length === 0 ? (
        <div className="empty-state">No reports found. <button onClick={resetFilters}>Clear filters</button></div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="reports-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Reporter</th>
                <th>Location</th>
                <th>Date</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr key={report.id}>
                  <td>{report.id}</td>
                  <td>{report.issue_type}</td>
                  <td>{report.full_name}</td>
                  <td>{report.location}</td>
                  <td>{report.created_at ? new Date(report.created_at).toLocaleDateString() : "N/A"}</td>
                  <td>{report.status}</td>
                  <td style={{ textAlign: "right" }}>
                    <div ref={activeActionId === report.id ? dropdownRef : null}>
                      <button onClick={() => toggleActionMenu(report.id)}><MoreVertical size={18} /></button>
                      {activeActionId === report.id && (
                        <div className="action-menu">
                          <button onClick={() => alert("View report details")}>View</button>
                          <button onClick={() => initiateDelete(report)}>Delete</button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {reportToDelete && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Delete Report?</h3>
            <p>Are you sure you want to delete report #{reportToDelete.id}?</p>
            <button onClick={() => setReportToDelete(null)}>Cancel</button>
            <button onClick={confirmDelete} disabled={isDeleting}>{isDeleting ? "Deleting..." : "Delete"}</button>
          </div>
        </div>
      )}
    </div>
  );
}
