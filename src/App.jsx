import { useState } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import "./App.css"

import LandingPage from "./pages/LandingPage"
import AdminLogin from "./pages/AdminLogin"
import AdminDashboard from "./pages/AdminDashboard"
import AdminReports from "./pages/AdminReports"
import AdminUsers from "./pages/AdminUsers"
import AdminSchedule from "./pages/AdminSchedule"
import AdminSettings from "./pages/AdminSettings"

import Sidebar from "./components/Sidebar"
import Topbar from "./components/Topbar"

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("isAuthenticated") === "true"
  })

  const [currentPage, setCurrentPage] = useState(() => {
    return localStorage.getItem("lastPage") || "Dashboard"
  })

  const [showLogin, setShowLogin] = useState(false)

  const handleNavigateToLogin = () => {
    setShowLogin(true)
  }

  const handleLogin = () => {
    localStorage.setItem("isAuthenticated", "true")
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("lastPage")
    setIsAuthenticated(false)
    setShowLogin(false)
    setCurrentPage("Dashboard")
  }

  const handlePageChange = (newPage) => {
    localStorage.setItem("lastPage", newPage)
    setCurrentPage(newPage)
  }

  if (isAuthenticated) {
    return (
      <Router>
        <div className="dashboard-layout">
          <Sidebar
            currentPage={currentPage}
            setCurrentPage={handlePageChange}
            onLogout={handleLogout}
          />

          <div className="main-content-wrapper">
          <Topbar 
            currentPage={currentPage} 
            setCurrentPage={handlePageChange} 
          /> 

            <div className="page-content-area">
              <Routes>
                <Route path="/" element={<AdminDashboard setCurrentPage={handlePageChange} />} />
                <Route path="/reports" element={<AdminReports setCurrentPage={handlePageChange} />} />
                <Route path="/users" element={<AdminUsers setCurrentPage={handlePageChange} />} />
                <Route path="/schedule" element={<AdminSchedule setCurrentPage={handlePageChange} />} />
                <Route path="/settings" element={<AdminSettings setCurrentPage={handlePageChange} />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </div>
        </div>
      </Router>
    )
  }

  if (showLogin) {
    return <AdminLogin onLogin={handleLogin} />
  }

  return <LandingPage onNavigate={handleNavigateToLogin} />
}
