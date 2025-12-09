import React, { useState } from "react"
import { NavLink } from "react-router-dom"
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  FileText, 
  Users, 
  Calendar, 
  Settings, 
  LogOut,
  Leaf 
} from "lucide-react"
import "./Sidebar.css"

export default function Sidebar({ onLogout }) {
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { label: "Dashboard", path: "/", icon: <LayoutDashboard size={20} /> },
    { label: "Reports", path: "/reports", icon: <FileText size={20} /> },
    { label: "Users", path: "/users", icon: <Users size={20} /> },
    { label: "Schedule", path: "/schedule", icon: <Calendar size={20} /> },
    { label: "Settings", path: "/settings", icon: <Settings size={20} /> },
  ]

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="sidebar-toggle"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="logo-box">
            <Leaf color="white" strokeWidth={2.5} size={24} />
          </div>
          <div className="logo-text">
            <h1 className="sidebar-title">EcoTrack</h1>
            <p className="sidebar-subtitle">Admin Dashboard</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => 
                isActive ? "nav-link active" : "nav-link"
              }
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button onClick={onLogout} className="logout-link">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {isOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setIsOpen(false)} 
        />
      )}
    </>
  )
}
