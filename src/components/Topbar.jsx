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
  const API_URL = import.meta.env.VITE_BACKEND_URL; // ✅ use env variable

  const fetchNewUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/new-users`);
      setNewUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNewReports = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/new-reports`);
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
  }, [newUsers, newReports, readIds]);

  const toggleNotif = () => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); };
  const toggleProfile = () => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); };

  const handleNotificationClick = (path, pageName, uniqueId) => {
    if (!readIds.includes(uniqueId)) setReadIds(prev => [...prev, uniqueId]);
    navigate(path);
    if (setCurrentPage) setCurrentPage(pageName);
    setIsNotifOpen(false);
  };

  const isUnread = (uniqueId) => !readIds.includes(uniqueId);

  return (
    <div className="topbar">
      {/* --- Existing JSX for search, notifications, profile --- */}
      {/* Only change is axios URLs */}
    </div>
  );
}
