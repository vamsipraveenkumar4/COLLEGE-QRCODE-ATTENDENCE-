import React from 'react';
import {
  Users, CheckCircle2, Clock, TrendingUp,
  BarChart2, Radio, AlertCircle, ArrowUpRight
} from 'lucide-react';

export default function DashboardView({ stats }) {
  if (!stats) {
    return (
      <div className="empty-state card" style={{ minHeight: '300px' }}>
        <div className="empty-state-icon">
          <BarChart2 size={28} color="var(--text-dim)" />
        </div>
        <p className="fw-700" style={{ color: 'var(--text-secondary)' }}>Loading statistics…</p>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>Connecting to backend API</p>
      </div>
    );
  }

  const {
    totalStudents  = 0,
    presentToday   = 0,
    lateToday      = 0,
    absentToday    = 0,
    attendanceRate = 0,
    departmentStats = [],
    recentScans    = [],
  } = stats;

  const statCards = [
    {
      label: 'Total Students',
      value: totalStudents,
      sub: 'enrolled across all branches',
      icon: Users,
      colorClass: 'blue',
    },
    {
      label: 'Present Today',
      value: presentToday,
      sub: `${absentToday} absent`,
      icon: CheckCircle2,
      colorClass: 'green',
    },
    {
      label: 'Late Arrivals',
      value: lateToday,
      sub: 'after cut-off time',
      icon: Clock,
      colorClass: 'amber',
    },
    {
      label: 'Attendance Rate',
      value: `${attendanceRate}%`,
      sub: 'overall for today',
      icon: TrendingUp,
      colorClass: 'violet',
    },
  ];

  return (
    <div className="flex-col gap-4" style={{ gap: '22px', display: 'flex', flexDirection: 'column' }}>

      {/* Stat Cards */}
      <div className="stats-row">
        {statCards.map(({ label, value, sub, icon: Icon, colorClass }) => (
          <div key={label} className={`card stat-card ${colorClass}`}>
            <div className="stat-top">
              <div className="flex-col" style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="stat-label">{label}</span>
              </div>
              <div className={`card-icon ${colorClass}`}>
                <Icon size={20} />
              </div>
            </div>
            <div className="stat-value">{value}</div>
            <div className="stat-sub">{sub}</div>
          </div>
        ))}
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: '22px' }}>

        {/* Department Attendance */}
        <div className="card">
          <div className="card-header" style={{ paddingBottom: '18px' }}>
            <div className="card-title">
              <div className="card-icon blue"><BarChart2 size={18} /></div>
              Today's Attendance by Department
            </div>
          </div>
          <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {departmentStats.length > 0 ? (
              departmentStats.map((dept) => {
                const pct = totalStudents > 0 ? Math.round((dept.count / totalStudents) * 100) : 0;
                return (
                  <div key={dept.department}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {dept.department}
                      </span>
                      <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--cyan)', fontWeight: 700 }}>
                        {dept.count} &nbsp;·&nbsp; {pct}%
                      </span>
                    </div>
                    <div className="progress-bar-track">
                      <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty-state" style={{ padding: '24px' }}>
                <AlertCircle size={28} color="var(--text-dim)" />
                <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>No QR scans recorded yet today</p>
              </div>
            )}
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="card">
          <div className="card-header" style={{ paddingBottom: '18px' }}>
            <div className="card-title">
              <div className="card-icon green"><Radio size={18} /></div>
              Live Scan Activity
            </div>
            <span className="badge badge-present" style={{ fontSize: '0.65rem' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
              LIVE
            </span>
          </div>
          <div style={{ padding: '0 18px 18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentScans.length > 0 ? (
              recentScans.slice(0, 7).map((scan) => (
                <div key={scan.id} className="feed-item">
                  <div
                    className="feed-dot"
                    style={{ background: scan.status === 'LATE' ? 'var(--warning)' : 'var(--success)' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {scan.student_name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                      {scan.roll_number}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                    <span className={`badge ${scan.status === 'LATE' ? 'badge-late' : 'badge-present'}`}>
                      {scan.status}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                      {(scan.timestamp || '').split(' ')[1] || scan.timestamp}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state" style={{ padding: '24px' }}>
                <Radio size={28} color="var(--text-dim)" />
                <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>No recent scans to display</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
