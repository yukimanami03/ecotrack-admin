import "./AdminSettings.css"
import { useEffect, useState } from "react"
import { Globe, Bell, Moon, Shield, Check, ChevronDown, Save } from "lucide-react"

export default function AdminSettings({ setCurrentPage }) {
  useEffect(() => {
    if (setCurrentPage) {
      setCurrentPage("Settings");
    }
  }, [setCurrentPage]);

  const [activeTab, setActiveTab] = useState('Appearance'); 

  const [formData, setFormData] = useState({
    orgName: "EcoTrack Environmental Services",
    adminEmail: "admin@ecotrack.com",
    timezone: "UTC",
    dataRetention: "2 Years",
    autoApprove: false,
    managerApproval: true,
    theme: "Light", 
    colorScheme: "Green (Eco)",
    compactMode: false,
    showAnimations: true,
    twoFactorAuth: true,
    sessionTimeout: true,
    sessionDuration: "30 minutes",
    passwordPolicy: "Strong (12+ chars, mixed case, numbers)",
    dataEncryption: true,
    auditLogging: true,
    anonymousAnalytics: false,
  });

  const [languageOpen, setLanguageOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const languages = ['English', 'Spanish', 'French', 'German'];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    if (formData.colorScheme === "Green (Eco)") {
      root.style.setProperty('--primary-green', '#10B981');
      root.style.setProperty('--primary-hover', '#059669');
    } else if (formData.colorScheme === "Blue (Ocean)") {
      root.style.setProperty('--primary-green', '#3B82F6'); 
      root.style.setProperty('--primary-hover', '#2563EB');
    } else if (formData.colorScheme === "Purple (Royal)") {
      root.style.setProperty('--primary-green', '#8B5CF6'); 
      root.style.setProperty('--primary-hover', '#7C3AED');
    }

    if (formData.compactMode) {
      body.classList.add('compact-mode');
    } else {
      body.classList.remove('compact-mode');
    }

    if (!formData.showAnimations) {
      body.classList.add('no-animations');
    } else {
      body.classList.remove('no-animations');
    }

    const applyDark = () => {
      body.classList.add('dark-theme');
      root.style.setProperty('--bg-light', '#111827'); 
      root.style.setProperty('--text-dark', '#F9FAFB'); 
      root.style.setProperty('--text-gray', '#9CA3AF'); 
      root.style.setProperty('--card-bg', '#1F2937'); 
      root.style.setProperty('--border-color', '#374151'); 
    };

    const applyLight = () => {
      body.classList.remove('dark-theme');
      root.style.setProperty('--bg-light', '#F9FAFB');
      root.style.setProperty('--text-dark', '#111827');
      root.style.setProperty('--text-gray', '#6B7280');
      root.style.setProperty('--card-bg', '#FFFFFF');
      root.style.setProperty('--border-color', '#E5E7EB');
    };

    if (formData.theme === 'Dark') {
      applyDark();
    } else if (formData.theme === 'Light') {
      applyLight();
    } else if (formData.theme === 'System') {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        applyDark();
      } else {
        applyLight();
      }
    }

  }, [formData]); 

  return (
    <div className="settings-page-container">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage your application preferences and configurations</p>
      </div>

      <div className="settings-wrapper">
        <div className="tabs-header">
          <button 
            className={`tab-btn ${activeTab === 'General' ? 'active' : ''}`}
            onClick={() => setActiveTab('General')}
          >
            <Globe size={18} /> General
          </button>
          <button 
            className={`tab-btn ${activeTab === 'Notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('Notifications')}
          >
            <Bell size={18} /> Notifications
          </button>
          <button 
            className={`tab-btn ${activeTab === 'Appearance' ? 'active' : ''}`}
            onClick={() => setActiveTab('Appearance')}
          >
            <Moon size={18} /> Appearance
          </button>
          <button 
            className={`tab-btn ${activeTab === 'Security' ? 'active' : ''}`}
            onClick={() => setActiveTab('Security')}
          >
            <Shield size={18} /> Security
          </button>
        </div>

        <div className="tab-content-area">
          {activeTab === 'General' && (
            <div className="fade-in">
              <div className="settings-card">
                <div className="card-padding">
                  <div className="card-header">
                    <h3>System Configuration</h3>
                    <p>Configure general system settings and preferences</p>
                  </div>
                  <div className="form-group">
                    <label>Organization Name</label>
                    <input type="text" name="orgName" value={formData.orgName} onChange={handleInputChange}/>
                  </div>
                  <div className="form-group">
                    <label>Admin Email</label>
                    <input type="email" name="adminEmail" value={formData.adminEmail} onChange={handleInputChange}/>
                  </div>
                  <div className="form-group">
                    <label>Timezone</label>
                    <div className="select-wrapper">
                      <select name="timezone" value={formData.timezone} onChange={handleInputChange}>
                        <option value="UTC">UTC</option>
                        <option value="EST">EST</option>
                        <option value="PST">PST</option>
                      </select>
                      <ChevronDown size={16} className="select-icon"/>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Language</label>
                    <div className="custom-select-container">
                      <div className="select-trigger" onClick={() => setLanguageOpen(!languageOpen)}>
                        <span>{selectedLanguage}</span>
                        <ChevronDown size={16} />
                      </div>
                      {languageOpen && (
                        <ul className="select-options">
                          {languages.map(lang => (
                            <li key={lang} onClick={() => { setSelectedLanguage(lang); setLanguageOpen(false); }} className={selectedLanguage === lang ? 'selected' : ''}>
                              {lang} {selectedLanguage === lang && <Check size={16} />}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                  <div className="form-actions-inline">
                    <button className="save-btn"><Save size={18} /> Save Changes</button>
                  </div>
                </div>
              </div>
              <div className="settings-card">
                <div className="card-padding">
                  <div className="card-header">
                    <h3>Report Settings</h3>
                    <p>Configure default report settings</p>
                  </div>
                  <div className="toggle-row">
                    <div className="toggle-info">
                      <label>Auto-approve reports</label>
                      <span className="help-text">Automatically approve reports from verified users</span>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" name="autoApprove" checked={formData.autoApprove} onChange={handleInputChange} />
                      <span className="slider round"></span>
                    </label>
                  </div>
                  <div className="toggle-row">
                    <div className="toggle-info">
                      <label>Require manager approval</label>
                      <span className="help-text">All reports must be approved by a manager</span>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" name="managerApproval" checked={formData.managerApproval} onChange={handleInputChange} />
                      <span className="slider round"></span>
                    </label>
                  </div>
                  <div className="form-group mt-4">
                    <label>Data Retention Period</label>
                    <div className="select-wrapper">
                      <select name="dataRetention" value={formData.dataRetention} onChange={handleInputChange}>
                        <option>1 Year</option>
                        <option>2 Years</option>
                        <option>5 Years</option>
                      </select>
                      <ChevronDown size={16} className="select-icon"/>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Notifications' && (
            <div className="fade-in">
              <div className="notification-card">
                <div className="card-header">
                  <h3>Email Notifications</h3>
                  <p>Manage email notification preferences</p>
                </div>
                <div className="setting-row">
                  <div className="setting-info">
                    <h4>New report submissions</h4>
                    <p>Get notified when users submit new reports</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider round"></span>
                  </label>
                </div>
                <div className="setting-row">
                  <div className="setting-info">
                    <h4>User registrations</h4>
                    <p>Get notified when new users register</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>
              <div className="notification-card">
                <div className="card-header">
                  <h3>Push Notifications</h3>
                  <p>Configure in-app notification settings</p>
                </div>
                <div className="setting-row">
                  <div className="setting-info">
                    <h4>Enable push notifications</h4>
                    <p>Receive real-time notifications in the app</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Appearance' && (
            <div className="settings-card fade-in">
              <div className="card-padding">
                <div className="card-header">
                  <h3>Display Settings</h3>
                  <p>Customize the look and feel of your dashboard</p>
                </div>

                <div className="form-group">
                  <label>Theme</label>
                  <div className="select-wrapper">
                    <select 
                      name="theme" 
                      value={formData.theme} 
                      onChange={handleInputChange}
                    >
                      <option value="Light">Light</option>
                      <option value="Dark">Dark</option>
                      <option value="System">System Default</option>
                    </select>
                    <ChevronDown size={16} className="select-icon"/>
                  </div>
                </div>

                <div className="form-group">
                  <label>Color Scheme</label>
                  <div className="select-wrapper">
                    <select 
                      name="colorScheme" 
                      value={formData.colorScheme} 
                      onChange={handleInputChange}
                    >
                      <option value="Green (Eco)">Green (Eco)</option>
                      <option value="Blue (Ocean)">Blue (Ocean)</option>
                      <option value="Purple (Royal)">Purple (Royal)</option>
                    </select>
                    <ChevronDown size={16} className="select-icon"/>
                  </div>
                </div>

                <div className="toggle-row">
                  <div className="toggle-info">
                    <label>Compact mode</label>
                    <span className="help-text">Reduce spacing and padding for more content</span>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      name="compactMode"
                      checked={formData.compactMode} 
                      onChange={handleInputChange} 
                    />
                    <span className="slider round"></span>
                  </label>
                </div>

                <div className="toggle-row">
                  <div className="toggle-info">
                    <label>Show animations</label>
                    <span className="help-text">Enable smooth transitions and animations</span>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      name="showAnimations"
                      checked={formData.showAnimations} 
                      onChange={handleInputChange} 
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'Security' && (
            <div className="fade-in">
              <div className="settings-card">
                <div className="card-padding">
                  <div className="card-header">
                    <h3>Authentication</h3>
                    <p>Manage authentication and access control settings</p>
                  </div>
                  <div className="toggle-row">
                    <div className="toggle-info">
                      <label>Two-factor authentication</label>
                      <span className="help-text">Require 2FA for all admin accounts</span>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" name="twoFactorAuth" checked={formData.twoFactorAuth} onChange={handleInputChange} />
                      <span className="slider round"></span>
                    </label>
                  </div>
                  <div className="toggle-row">
                    <div className="toggle-info">
                      <label>Session timeout</label>
                      <span className="help-text">Automatically log out inactive users</span>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" name="sessionTimeout" checked={formData.sessionTimeout} onChange={handleInputChange} />
                      <span className="slider round"></span>
                    </label>
                  </div>
                  <div className="form-group mt-4">
                    <label>Session Duration</label>
                    <div className="select-wrapper">
                      <select name="sessionDuration" value={formData.sessionDuration} onChange={handleInputChange} disabled={!formData.sessionTimeout}>
                        <option>15 minutes</option>
                        <option>30 minutes</option>
                        <option>1 hour</option>
                        <option>4 hours</option>
                      </select>
                      <ChevronDown size={16} className="select-icon"/>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Password Policy</label>
                    <div className="select-wrapper">
                      <select name="passwordPolicy" value={formData.passwordPolicy} onChange={handleInputChange}>
                        <option>Standard (8+ chars)</option>
                        <option>Strong (12+ chars, mixed case, numbers)</option>
                        <option>Strict (16+ chars, mixed case, numbers, symbols)</option>
                      </select>
                      <ChevronDown size={16} className="select-icon"/>
                    </div>
                  </div>
                </div>
              </div>
              <div className="settings-card">
                <div className="card-padding">
                  <div className="card-header">
                    <h3>Data & Privacy</h3>
                    <p>Configure data handling and privacy settings</p>
                  </div>
                  <div className="toggle-row">
                    <div className="toggle-info">
                      <label>Data encryption</label>
                      <span className="help-text">Encrypt sensitive data at rest</span>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" name="dataEncryption" checked={formData.dataEncryption} onChange={handleInputChange} />
                      <span className="slider round"></span>
                    </label>
                  </div>
                  <div className="toggle-row">
                    <div className="toggle-info">
                      <label>Audit logging</label>
                      <span className="help-text">Log all administrative actions</span>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" name="auditLogging" checked={formData.auditLogging} onChange={handleInputChange} />
                      <span className="slider round"></span>
                    </label>
                  </div>
                  <div className="toggle-row">
                    <div className="toggle-info">
                      <label>Anonymous analytics</label>
                      <span className="help-text">Collect anonymous usage statistics</span>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" name="anonymousAnalytics" checked={formData.anonymousAnalytics} onChange={handleInputChange} />
                      <span className="slider round"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}