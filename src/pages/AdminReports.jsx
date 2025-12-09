import "./AdminReports.css";
import { useState, useEffect, useRef } from "react";
import {
  MoreVertical, Search, Filter, Eye, Trash2, Loader, FileText,
  ArrowLeft, MapPin, User, CalendarClock, X
} from "lucide-react";

export default function AdminReports({ setCurrentPage }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);

  // FETCH REPORTS (no token required)
  useEffect(() => {
    async function fetchReports() {
      try {
        const response = await fetch("http://localhost:3000/api/reports");

        if (!response.ok) {
          throw new Error("Error loading reports");
        }

        const data = await response.json();
        setReports(data);
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="loader-container">
        <Loader className="loader-icon" />
        <p>Loading Reports...</p>
      </div>
    );
  }

  return (
    <div className="admin-reports-container">

      {/* BACK BUTTON */}
      <button className="back-btn" onClick={() => setCurrentPage("dashboard")}>
        <ArrowLeft size={20} /> Back
      </button>

      <h1 className="header-title">Reports</h1>

      {/* REPORTS TABLE */}
      <div className="table-container">
        <table className="reports-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Issue Type</th>
              <th>Priority</th>
              <th>Reporter</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {reports.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-text">No reports found</td>
              </tr>
            ) : (
              reports.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.issue_type}</td>
                  <td>{r.priority}</td>
                  <td>{r.full_name}</td>
                  <td className={`status ${r.status.toLowerCase()}`}>
                    {r.status}
                  </td>
                  <td>{new Date(r.created_at).toLocaleString()}</td>

                  <td>
                    <button
                      className="action-btn view"
                      onClick={() => setSelectedReport(r)}
                    >
                      <Eye size={18} />
                    </button>

                    <button
                      className="action-btn delete"
                      onClick={() => alert("Delete not implemented yet")}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* VIEW MODAL */}
      {selectedReport && (
        <div className="modal-overlay">
          <div className="report-modal">
            <button className="close-btn" onClick={() => setSelectedReport(null)}>
              <X />
            </button>

            <h2>Report Details</h2>

            <div className="modal-section">
              <p><strong>Issue:</strong> {selectedReport.issue_type}</p>
              <p><strong>Priority:</strong> {selectedReport.priority}</p>
              <p><strong>Status:</strong> {selectedReport.status}</p>

              <p><strong>Description:</strong><br /> {selectedReport.description}</p>

              <hr />

              <p><strong>Reporter:</strong> {selectedReport.full_name}</p>
              <p><strong>Phone:</strong> {selectedReport.phone}</p>
              <p><strong>Email:</strong> {selectedReport.email}</p>

              <p><strong>Location:</strong> {selectedReport.location}</p>

              <p><strong>Created At:</strong><br />
                {new Date(selectedReport.created_at).toLocaleString()}
              </p>

              <hr />

              <h3>Attached Files</h3>

              {selectedReport.files && selectedReport.files.length > 0 ? (
                <div className="image-list">
                  {selectedReport.files.map((file, index) => (
                    <img
                      key={index}
                      src={file}
                      alt="Report file"
                      className="report-image"
                    />
                  ))}
                </div>
              ) : (
                <p>No files uploaded</p>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
