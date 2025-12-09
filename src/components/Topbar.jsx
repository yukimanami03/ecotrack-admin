import React, { useState, useEffect } from "react";
import "./Topbar.css";
import axios from "axios";
import { Bell, Search, User, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Topbar({ setCurrentPage }) {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [readIds, setReadIds] = useState(() => {
    const savedIds = localStorage.getItem("readNotificationIds");
    return savedIds ? JSON.parse(savedIds) : [];
  });

  const [notifCount, setNotifCount] = useState(0);
  
  const [newUsers, setNewUsers] = useState([]);
  const [newReports, setNewReports] = useState([]);

  const navigate = useNavigate();

  const fetchNewUsers = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/admin/new-users");
      setNewUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNewReports = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/admin/new-reports");
      setNewReports(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNewUsers();
    fetchNewReports();
  }, []);

  useEffect(() => {
    localStorage.setItem("readNotificationIds", JSON.stringify(readIds));
  }, [readIds]);

  useEffect(() => {
    const unreadUsers = newUsers.filter(u => !readIds.includes(`user-${u.id}`)).length;
    const unreadReports = newReports.filter(r => !readIds.includes(`report-${r.id}`)).length;
    setNotifCount(unreadUsers + unreadReports);
  }, [newUsers, newReports, readIds]); // Modagan ni kada update sa data o kung may gi-click ka

  const toggleNotif = async () => {
    setIsNotifOpen(!isNotifOpen);
    setIsProfileOpen(false);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
    setIsNotifOpen(false);
  };

  const handleNotificationClick = (path, pageName, uniqueId) => {
    if (!readIds.includes(uniqueId)) {
      setReadIds((prev) => [...prev, uniqueId]);
    }

    navigate(path);
    if (setCurrentPage) {
      setCurrentPage(pageName);
    }
    setIsNotifOpen(false);
  };

  const isUnread = (uniqueId) => !readIds.includes(uniqueId);

  return (
    <div className="topbar">
      <div className="topbar-search-wrapper">
        <Search size={20} color="#94a3b8" />
        <input
          type="text"
          className="topbar-search-input"
          placeholder="Search reports, users, schedules..."
        />
      </div>

      <div className="topbar-actions">
        <div className="action-wrapper">
          <button className="notification-button" onClick={toggleNotif}>
            <Bell size={28} strokeWidth={2} />
            
            {notifCount > 0 && (
              <span className="notification-badge">
                {notifCount > 9 ? "9+" : notifCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="dropdown-menu notification-dropdown">
              <div className="dropdown-header">Notifications</div>

              {newUsers.length === 0 && newReports.length === 0 ? (
                <p className="no-notif">No new notifications</p>
              ) : (
                <>
                  {newUsers.map((u) => {
                    const uniqueId = `user-${u.id}`;
                    return (
                      <div 
                        className={`dropdown-item ${isUnread(uniqueId) ? "unread-item" : ""}`}
                        key={uniqueId}
                        onClick={() => handleNotificationClick('/users', 'Users', uniqueId)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="notif-icon bg-green-100">
                          <User size={18} color="#16a34a" />
                        </div>
                        <div className="notif-content">
                          <p className="notif-title">{u.fullName}</p>
                          <p className="notif-desc">{u.email}</p>
                          <span className="notif-time">New today</span>
                        </div>
                        {isUnread(uniqueId) && <div className="unread-dot"></div>}
                      </div>
                    );
                  })}

                  {newReports.map((r) => {
                    const uniqueId = `report-${r.id}`;
                    return (
                      <div 
                        className={`dropdown-item ${isUnread(uniqueId) ? "unread-item" : ""}`}
                        key={uniqueId}
                        onClick={() => handleNotificationClick('/reports', 'Reports', uniqueId)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="notif-icon bg-blue-100">
                          <FileText size={18} color="#2563eb" />
                        </div>
                        <div className="notif-content">
                          <p className="notif-title">New report submitted</p>
                          <p className="notif-desc">{r.description}</p>
                          <span className="notif-time">Just now</span>
                        </div>
                        {isUnread(uniqueId) && <div className="unread-dot"></div>}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}
        </div>

        <div className="action-wrapper">
          <div className="profile-section" onClick={toggleProfile}>
            <div className="profile-info">
              <span className="profile-name">Admin User</span>
              <span className="profile-email">admin@ecotrack.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}