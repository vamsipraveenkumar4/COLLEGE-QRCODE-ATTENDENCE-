import React, { useState } from 'react';
import { Download, Search, Calendar, FileText, RefreshCw, Filter, X } from 'lucide-react';

export default function LogsView({ logs, courses, onExportCSV, onRefreshLogs }) {
  const [dateFilter,   setDateFilter]   = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search,       setSearch]       = useState('');
  const [refreshing,   setRefreshing]   = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefreshLogs();
    setTimeout(() => setRefreshing(false), 600);
  };

  const clearFilters = () => {
    setDateFilter(''); setCourseFilter(''); setStatusFilter(''); setSearch('');
  };

  const hasFilter = dateFilter || courseFilter || statusFilter || search;

  const filtered = logs.filter(log => {
    const qr = log.qrcode_id || log.barcode_id || '';
    const q  = search.toLowerCase();
    return (
      (!dateFilter   || log.date === dateFilter) &&
      (!courseFilter || log.course_id.toString() === courseFilter) &&
      (!statusFilter || log.status === statusFilter) &&
      (!search || log.student_name.toLowerCase().includes(q) || log.roll_number.toLowerCase().includes(q) || qr.toLowerCase().includes(q))
    );
  });

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '22px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
        <div className="card-title">
          <div className="card-icon blue"><FileText size={18} /></div>
          Attendance Logs &amp; Audit History
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleRefresh}
            style={{ color: refreshing ? 'var(--blue)' : undefined }}
          >
            <RefreshCw size={14} style={{ animation: refreshing ? 'spin 0.6s linear infinite' : 'none' }} />
            Refresh
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => onExportCSV(dateFilter)} id="export-logs-btn">
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="filters-bar" style={{ margin: '0 24px 18px' }}>
        {/* Date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={14} color="var(--text-dim)" />
          <input
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="form-control"
            style={{ padding: '6px 10px', fontSize: '0.82rem', width: 'auto' }}
          />
        </div>

        {/* Course */}
        <select value={courseFilter} onChange={e => setCourseFilter(e.target.value)}
          className="form-control" style={{ padding: '6px 10px', fontSize: '0.82rem', width: 'auto' }}>
          <option value="">All Courses</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
        </select>

        {/* Status */}
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="form-control" style={{ padding: '6px 10px', fontSize: '0.82rem', width: 'auto' }}>
          <option value="">All Statuses</option>
          <option value="PRESENT">Present</option>
          <option value="LATE">Late</option>
        </select>

        {/* Search */}
        <div className="search-wrap" style={{ flex: 1, minWidth: '200px' }}>
          <Search size={14} color="var(--text-dim)" />
          <input
            placeholder="Search student, roll number, QR code…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {hasFilter && (
          <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
            <X size={13} />
            Clear
          </button>
        )}
      </div>

      {/* Summary row */}
      <div style={{ display: 'flex', gap: '10px', margin: '0 24px 16px', flexWrap: 'wrap' }}>
        <span className="badge badge-blue">
          {filtered.length} record{filtered.length !== 1 ? 's' : ''}
        </span>
        {filtered.filter(l => l.status === 'PRESENT').length > 0 && (
          <span className="badge badge-present">
            ✓ {filtered.filter(l => l.status === 'PRESENT').length} Present
          </span>
        )}
        {filtered.filter(l => l.status === 'LATE').length > 0 && (
          <span className="badge badge-late">
            ⏱ {filtered.filter(l => l.status === 'LATE').length} Late
          </span>
        )}
      </div>

      {/* Table */}
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>PIN No.</th>
              <th>Student Name</th>
              <th>Department</th>
              <th>Course</th>
              <th>Status</th>
              <th>Method</th>
              <th>QR Code</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map(log => (
                <tr key={log.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                    {log.timestamp}
                  </td>
                  <td>
                    <span className="cell-mono">{log.roll_number}</span>
                  </td>
                  <td style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{log.student_name}</td>
                  <td>
                    <span className={`badge ${(log.student_department || '').includes('AI') ? 'badge-violet' : 'badge-blue'}`}
                      style={{ fontSize: '0.68rem' }}>
                      {(log.student_department || '').includes('AI') ? 'AI & DS' : 'CSE'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 800, color: 'var(--blue)', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                      {log.course_code}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${log.status === 'LATE' ? 'badge-late' : 'badge-present'}`}>
                      {log.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{log.scan_method}</td>
                  <td>
                    <span className="cell-mono" style={{ background: 'var(--cyan-dim)', color: 'var(--cyan)' }}>
                      {log.qrcode_id || log.barcode_id}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8}>
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <FileText size={24} color="var(--text-dim)" />
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>No records found</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                      {hasFilter ? 'Try adjusting the filter criteria' : 'No attendance has been recorded yet'}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
