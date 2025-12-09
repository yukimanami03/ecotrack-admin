import "./AdminUsers.css";
import { useEffect, useState, useRef } from "react";
import { MoreVertical, Search, Filter, Mail, Trash2, Loader2, X } from "lucide-react";

export default function AdminUsers({ setCurrentPage }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");   
  const [statusFilter, setStatusFilter] = useState("All"); 
  const [showFilterMenu, setShowFilterMenu] = useState(false); 
  const [activeActionId, setActiveActionId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const dropdownRef = useRef(null);
  const filterRef = useRef(null); 

  const token = localStorage.getItem("token"); // Use token for admin auth

  useEffect(() => {
    if (setCurrentPage) setCurrentPage("Users");
  }, [setCurrentPage]);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/users`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();

        const formattedUsers = data.map(user => {
          let statusLabel = user.status || (user.isActive ? "Active" : "Inactive") || "Active";
          let roleLabel = user.role || "User";
          if (user.email === "admin@email.com" || user.role === "super_admin") roleLabel = "Admin";

          return {
            id: user.id,
            name: user.fullName || "Unknown User",
            email: user.email,
            role: roleLabel,
            status: statusLabel,
            avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || "User")}&background=random`,
          };
        });

        setUsers(formattedUsers);
      } catch (err) {
        console.error(err);
        setError("Failed to load users. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchUsers();
  }, [token]);

  const confirmDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/users/${userToDelete.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error("Failed to delete user");

      setUsers(users.filter(u => u.id !== userToDelete.id));
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (err) {
      console.error(err);
      alert("Something went wrong while deleting the user.");
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

  const initiateDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
    setActiveActionId(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "All" || user.role === roleFilter;
    const matchesStatus = statusFilter === "All" || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const resetFilters = () => {
    setRoleFilter("All");
    setStatusFilter("All");
    setSearchTerm("");
    setShowFilterMenu(false);
  };

  const stats = [
    { label: "Total Users", value: users.length },
    { label: "Active Users", value: users.filter(u => u.status === "Active").length },
    { label: "Admins", value: users.filter(u => u.role === "Admin").length },
    { label: "Inactive", value: users.filter(u => u.status === "Inactive").length },
  ];

  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="users-container">
      <div className="page-header">
        <div className="page-title">
          <h1>Users</h1>
          <p>Manage user accounts and permissions</p>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className="stat-card">
            <p className="stat-label">{stat.label}</p>
            <p className="stat-value">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="controls-bar">
        <div className="search-wrapper">
          <Search className="search-icon" />
          <input 
            type="text"
            placeholder="Search users by name or email..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && <button className="clear-search-btn" onClick={() => setSearchTerm("")}><X size={14} /></button>}
        </div>

        <div className="filter-wrapper" ref={filterRef}>
          <button 
            className={`filter-btn ${showFilterMenu || roleFilter !== "All" || statusFilter !== "All" ? 'active' : ''}`}
            onClick={() => setShowFilterMenu(!showFilterMenu)}
          >
            <Filter size={18} /> Filters
            {(roleFilter !== "All" || statusFilter !== "All") && <span className="filter-badge-count">!</span>}
          </button>

          {showFilterMenu && (
            <div className="filter-menu">
              <div className="filter-section">
                <p className="filter-label">Role</p>
                <div className="filter-options">
                  {["All","Admin","User"].map(role => (
                    <button key={role} className={`filter-chip ${roleFilter===role?'selected':''}`} onClick={()=>setRoleFilter(role)}>{role}</button>
                  ))}
                </div>
              </div>
              <div className="filter-section">
                <p className="filter-label">Status</p>
                <div className="filter-options">
                  {["All","Active","Inactive"].map(status => (
                    <button key={status} className={`filter-chip ${statusFilter===status?'selected':''}`} onClick={()=>setStatusFilter(status)}>{status}</button>
                  ))}
                </div>
              </div>
              <div className="filter-actions">
                <button className="btn-reset" onClick={resetFilters}>Reset All</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="table-container">
        <div className="table-header-title">
          <h2>{searchTerm || roleFilter!=="All" || statusFilter!=="All" ? "Filtered Results" : "All Users"} ({filteredUsers.length})</h2>
        </div>

        {loading ? (
          <div className="loading-state">
            <Loader2 className="animate-spin" size={32} />
            <p>Loading user data...</p>
          </div>
        ) : filteredUsers.length===0 ? (
          <div className="empty-state">
            <p>No users found matching your criteria.</p>
            <button className="btn-reset-link" onClick={resetFilters}>Clear filters</button>
          </div>
        ) : (
          <div style={{ overflowX:'auto', minHeight:'400px' }}>
            <table className="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th style={{textAlign:'right'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-profile">
                        <img src={user.avatar} alt={user.name} className="user-avatar" />
                        <div className="user-details">
                          <p className="user-name">{user.name}</p>
                          <p className="user-email">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td><span className={`badge role-${user.role.toLowerCase()}`}>{user.role}</span></td>
                    <td><span className={`badge status-${user.status.toLowerCase()}`}>{user.status}</span></td>
                    <td style={{textAlign:'right'}}>
                      <div className="action-wrapper" ref={activeActionId===user.id?dropdownRef:null}>
                        <button className={`action-btn ${activeActionId===user.id?'active':''}`} onClick={()=>toggleActionMenu(user.id)}>
                          <MoreVertical size={18} />
                        </button>
                        {activeActionId===user.id && (
                          <div className="action-menu">
                            <button onClick={()=>window.location.href=`mailto:${user.email}`} className="menu-item"><Mail size={14} /> Send Email</button>
                            <div className="menu-divider"></div>
                            <button onClick={()=>initiateDelete(user)} className="menu-item delete"><Trash2 size={14} /> Delete User</button>
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
      </div>

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Are you sure?</h3>
            <p className="modal-text">This action cannot be undone. This will permanently delete <strong>{userToDelete?.name}</strong> and all associated data.</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={cancelDelete} disabled={isDeleting}>Cancel</button>
              <button className="btn-delete" onClick={confirmDelete} disabled={isDeleting}>{isDeleting?"Deleting...":"Delete User"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
