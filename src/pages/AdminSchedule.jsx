import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AdminSchedule.css"; 
import { FaTrashAlt, FaRecycle, FaLeaf, FaPlus, FaPen } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { BsCalendar4Event } from "react-icons/bs";
import { FiAlertTriangle } from "react-icons/fi";

const AdminSchedule = () => {
  const API_URL = import.meta.env.VITE_API_URL; // <-- environment variable

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const [formData, setFormData] = useState({
    day: "Monday",
    collection_date: "",
    type: "General Waste",
    start_time: "07:00",
    end_time: "09:00",
  });

  // ------------------------------
  // Fetch schedules on mount
  // ------------------------------
  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/schedules`);
      setSchedules(res.data);
    } catch (err) {
      console.error("Failed to fetch schedules:", err);
    }
  };

  // ------------------------------
  // Modal open/close
  // ------------------------------
  const handleOpenModal = (schedule = null) => {
    if (schedule) {
      setEditingId(schedule.id);
      setFormData({
        day: schedule.day,
        collection_date: schedule.collection_date || "", 
        type: schedule.type,
        start_time: schedule.start_time,
        end_time: schedule.end_time,
      });
    } else {
      setEditingId(null);
      setFormData({
        day: "Monday",
        collection_date: "",
        type: "General Waste",
        start_time: "07:00",
        end_time: "09:00",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  // ------------------------------
  // Delete schedule
  // ------------------------------
  const promptDelete = (id) => setDeleteModal({ isOpen: true, id });
  const closeDeleteModal = () => setDeleteModal({ isOpen: false, id: null });

  const confirmDelete = async () => {
    const id = deleteModal.id;
    if (!id) return;

    try {
      await axios.delete(`${API_URL}/api/admin/schedules/${id}`);
      setSchedules(prev => prev.filter(s => s.id !== id));
      closeDeleteModal();
    } catch (err) {
      console.error("Error deleting schedule:", err);
      alert("Failed to delete schedule.");
    }
  };

  // ------------------------------
  // Form input handling
  // ------------------------------
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeSelect = (type) => setFormData(prev => ({ ...prev, type }));

  const handleSubmit = async () => {
    const payload = { ...formData };
    try {
      if (editingId) {
        await axios.put(`${API_URL}/api/admin/schedules/${editingId}`, payload);
      } else {
        await axios.post(`${API_URL}/api/admin/schedules`, payload);
      }
      handleCloseModal();
      fetchSchedules(); 
    } catch (err) {
      console.error("Error saving schedule:", err);
      alert("Failed to save schedule.");
    }
  };

  // ------------------------------
  // Utilities for icons and classes
  // ------------------------------
  const getIcon = (type) => {
    if (type === "General Waste") return <FaTrashAlt />;
    if (type === "Recyclables") return <FaRecycle />;
    if (type === "Organic Waste") return <FaLeaf />;
    return <FaTrashAlt />;
  };

  const getTypeClass = (type) => {
    if (type === "General Waste") return "type-general";
    if (type === "Recyclables") return "type-recycle";
    if (type === "Organic Waste") return "type-organic";
    return "";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // ------------------------------
  // Render
  // ------------------------------
  return (
    <div className="admin-container">
      {/* Header */}
      <div className="header-section">
        <div>
          <h1>Weekly Schedule</h1>
          <p className="subtitle">Manage collection times and waste types</p>
        </div>
        <button className="btn-add" onClick={() => handleOpenModal(null)}>
          <FaPlus /> Add Schedule
        </button>
      </div>

      {/* Waste type guide */}
      <div className="guide-section">
        <h4>Waste Type Guide</h4>
        <div className="guide-cards">
          <div className="guide-card general"><div className="icon-box"><FaTrashAlt /></div><div><h5>General Waste</h5><p>Non-recyclable items</p></div></div>
          <div className="guide-card recycle"><div className="icon-box"><FaRecycle /></div><div><h5>Recyclables</h5><p>Paper, plastic, glass</p></div></div>
          <div className="guide-card organic"><div className="icon-box"><FaLeaf /></div><div><h5>Organic Waste</h5><p>Food scraps, garden waste</p></div></div>
        </div>
      </div>

      <h4 className="section-title">Weekly Overview</h4>
      <div className="schedule-grid">
        {daysOfWeek.map(day => {
          const daySchedules = schedules.filter(s => s.day === day);
          const displayDate = daySchedules.length > 0 ? formatDate(daySchedules[0].collection_date) : "-";

          return (
            <div className="day-card" key={day}>
              <div className="day-header"><span className="day-name">{day}</span><span className="day-date">{displayDate}</span></div>
              <div className="day-body">
                {daySchedules.length > 0 ? daySchedules.map(item => (
                  <div key={item.id} className={`schedule-item ${getTypeClass(item.type)}`}>
                    <div className="item-icon">{getIcon(item.type)}</div>
                    <div className="item-info">
                      <span className="item-type">{item.type}</span>
                      <span className="item-time">{item.start_time} - {item.end_time}</span>
                    </div>
                    <div className="hover-actions">
                      <button className="action-btn edit" onClick={() => handleOpenModal(item)}><FaPen /></button>
                      <button className="action-btn delete" onClick={() => promptDelete(item.id)}><FaTrashAlt /></button>
                    </div>
                  </div>
                )) : (
                  <div className="no-collection"><BsCalendar4Event className="no-col-icon"/><p>No Collection</p></div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingId ? "Edit Schedule" : "Add Collection Schedule"}</h3>
              <button className="close-btn" onClick={handleCloseModal}><IoMdClose /></button>
            </div>
            <div className="modal-body">
              <label>Day of Week</label>
              <select name="day" value={formData.day} onChange={handleInputChange} className="custom-select">
                {daysOfWeek.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <label>Collection Date</label>
              <input type="date" name="collection_date" value={formData.collection_date} onChange={handleInputChange} className="custom-input"/>
              <label>Waste Type</label>
              <div className="type-selector">
                {["General Waste", "Recyclables", "Organic Waste"].map(type => (
                  <div key={type} className={`type-option ${formData.type === type ? 'selected' : ''}`} onClick={() => handleTypeSelect(type)}>{type}</div>
                ))}
              </div>
              <div className="time-row">
                <div className="time-group">
                  <label>Start Time</label>
                  <input type="time" name="start_time" value={formData.start_time} onChange={handleInputChange} />
                </div>
                <div className="time-group">
                  <label>End Time</label>
                  <input type="time" name="end_time" value={formData.end_time} onChange={handleInputChange} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={handleCloseModal}>Cancel</button>
              <button className="btn-submit" onClick={handleSubmit}>{editingId ? "Update Schedule" : "Add Schedule"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content delete-modal">
            <div className="delete-icon-box"><FiAlertTriangle /></div>
            <h3 className="delete-title">Delete Schedule?</h3>
            <p className="delete-text">Are you sure you want to delete this schedule? This action cannot be undone.</p>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={closeDeleteModal}>Cancel</button>
              <button className="btn-danger" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminSchedule;
