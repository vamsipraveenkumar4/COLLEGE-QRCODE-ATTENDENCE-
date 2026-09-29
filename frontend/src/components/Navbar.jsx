import React from 'react';
import {
  QrCode, LayoutDashboard, Users, FileText,
  GraduationCap, Wifi, WifiOff, Activity
} from 'lucide-react';

const NAV_ITEMS = [
  {
    id: 'scanner',
    label: 'QR Scanner',
    icon: QrCode,
    section: 'ATTENDANCE',
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    section: 'ATTENDANCE',
  },
  {
    id: 'students',
    label: 'Students',
    icon: Users,
    section: 'MANAGEMENT',
    badgeKey: 'studentCount',
  },
  {
    id: 'logs',
    label: 'Attendance Logs',
    icon: FileText,
    section: 'MANAGEMENT',
    badgeKey: 'logCount',
  },
];

export default function Navbar({ activeTab, setActiveTab, isConnected, studentCount, logCount }) {
  const badges = { studentCount, logCount };

  // Group items by section
  const sections = [...new Set(NAV_ITEMS.map(n => n.section))];

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="brand-logo-wrap">
          <GraduationCap size={26} />
        </div>
        <div className="brand-name">CIST Attendance</div>
        <div className="brand-tagline">
          Chaitanya Institute of Science &amp; Technology
          <br />CSE &amp; AI/DS Departments
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {sections.map((section) => (
          <React.Fragment key={section}>
            <div className="nav-section-label">{section}</div>
            {NAV_ITEMS.filter(n => n.section === section).map(({ id, label, icon: Icon, badgeKey }) => {
              const isActive = activeTab === id;
              const badgeVal = badgeKey ? badges[badgeKey] : null;

              return (
                <button
                  key={id}
                  className={`nav-item${isActive ? ' active' : ''}`}
                  onClick={() => setActiveTab(id)}
                  id={`nav-${id}`}
                >
                  <span className="nav-item-icon">
                    <Icon size={17} />
                  </span>
                  <span style={{ flex: 1 }}>{label}</span>
                  {badgeVal > 0 && (
                    <span className="nav-item-badge">{badgeVal > 999 ? '999+' : badgeVal}</span>
                  )}
                </button>
              );
            })}
          </React.Fragment>
        ))}
      </nav>

      {/* Footer — Server Status */}
      <div className="sidebar-footer">
        <div className={`server-status-pill${isConnected ? '' : ' offline'}`}>
          <span className="status-pulse" />
          <span style={{ flex: 1 }}>
            {isConnected ? 'Server Connected' : 'Server Offline'}
          </span>
          {isConnected
            ? <Wifi size={14} style={{ opacity: 0.7 }} />
            : <WifiOff size={14} style={{ opacity: 0.7 }} />
          }
        </div>

        {isConnected && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '8px',
              fontSize: '0.72rem',
              color: 'var(--text-dim)',
              padding: '0 4px',
            }}
          >
            <Activity size={11} />
            <span>API: localhost:5000</span>
          </div>
        )}
      </div>
    </aside>
  );
}
