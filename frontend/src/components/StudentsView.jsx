import React, { useState } from 'react';
import { UserPlus, Search, QrCode, Trash2, Printer, X, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function StudentsView({ students, onAddStudent, onDeleteStudent, onRefresh }) {
  const [search, setSearch]                     = useState('');
  const [deptFilter, setDeptFilter]             = useState('');
  const [showModal, setShowModal]               = useState(false);
  const [expandedId, setExpandedId]             = useState(null);
  const [formData, setFormData]                 = useState({
    roll_number: '', name: '',
    department: 'Artificial Intelligence & Data Science', email: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.roll_number || !formData.name) return;
    const res = await onAddStudent(formData);
    if (res?.success) {
      setShowModal(false);
      setFormData({ roll_number: '', name: '', department: 'Artificial Intelligence & Data Science', email: '' });
      onRefresh();
    }
  };

  const filtered = students.filter(s => {
    const qr = s.qrcode_id || s.barcode_id || '';
    const q  = search.toLowerCase();
    return (
      (!search || s.name.toLowerCase().includes(q) || s.roll_number.toLowerCase().includes(q) || qr.toLowerCase().includes(q)) &&
      (!deptFilter || s.department === deptFilter)
    );
  });

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '22px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>Student Directory</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '2px' }}>
            {students.length} students enrolled across all branches
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)} id="add-student-btn">
          <UserPlus size={16} />
          Add Student
        </button>
      </div>

      {/* Filter bar */}
      <div className="filters-bar" style={{ margin: '0 24px 18px', flexWrap: 'wrap' }}>
        <div className="search-wrap" style={{ flex: 1, minWidth: '200px' }}>
          <Search size={15} color="var(--text-dim)" />
          <input
            placeholder="Search name, PIN, QR code…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={14} color="var(--text-dim)" />
          <select
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
            className="form-control"
            style={{ width: 'auto', padding: '7px 12px', fontSize: '0.82rem' }}
          >
            <option value="">All Branches</option>
            <option value="Computer Science & Engineering">CSE</option>
            <option value="Artificial Intelligence & Data Science">AI &amp; DS</option>
          </select>
        </div>
        {(search || deptFilter) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setDeptFilter(''); }}>
            <X size={13} />
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>PIN Number</th>
              <th>Student Name</th>
              <th>Department</th>
              <th>QR Payload</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? filtered.map(s => {
              const qrVal    = s.qrcode_id || s.barcode_id;
              const isExpanded = expandedId === s.id;
              const isAI     = s.department.includes('AI') || s.department.includes('Artificial');

              return (
                <React.Fragment key={s.id}>
                  <tr style={{ background: isExpanded ? 'rgba(99,140,255,0.05)' : undefined }}>
                    <td>
                      <span className="cell-mono">{s.roll_number}</span>
                    </td>
                    <td style={{ fontWeight: 700 }}>{s.name}</td>
                    <td>
                      <span className={`badge ${isAI ? 'badge-violet' : 'badge-blue'}`}>
                        {isAI ? 'AI & DS' : 'CSE'}
                      </span>
                    </td>
                    <td>
                      <span className="cell-mono" style={{ background: 'var(--cyan-dim)', color: 'var(--cyan)' }}>{qrVal}</span>
                    </td>
                    <td style={{ color: 'var(--text-dim)', fontSize: '0.82rem' }}>{s.email || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className={`btn btn-sm ${isExpanded ? 'btn-primary' : 'btn-ghost'}`}
                          onClick={() => setExpandedId(isExpanded ? null : s.id)}
                        >
                          <QrCode size={13} />
                          {isExpanded ? 'Hide' : 'QR Pass'}
                          {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => onDeleteStudent(s.id)}
                          title="Delete student"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* QR Pass expansion row */}
                  {isExpanded && (
                    <tr>
                      <td colSpan={6} style={{ padding: '0 24px 22px', background: 'rgba(12,18,35,0.95)', borderBottom: '2px solid rgba(99,140,255,0.25)' }}>
                        <div style={{ marginTop: '14px' }}>
                          {/* QR Pass Card */}
                          <div className="qr-pass" style={{ maxWidth: 460 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                              <div>
                                <div className="qr-pass-header">Chaitanya Institute of Science and Technology</div>
                                <div className="qr-pass-dept">Dept. of {s.department}</div>
                              </div>
                              <button
                                onClick={() => setExpandedId(null)}
                                style={{ background: 'rgba(0,0,0,0.07)', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', flexShrink: 0 }}
                              >
                                <X size={15} />
                              </button>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                              {/* QR Code */}
                              <div style={{ background: '#fff', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', flexShrink: 0 }}>
                                <QRCodeSVG value={qrVal} size={140} bgColor="#ffffff" fgColor="#0a1020" level="H" includeMargin={false} />
                              </div>

                              {/* Student Info */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0a1020', lineHeight: 1.2 }}>{s.name}</div>
                                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#2563eb', fontFamily: 'monospace' }}>
                                  PIN: {s.roll_number}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>
                                  QR: {qrVal}
                                </div>
                                <button
                                  className="btn btn-primary btn-sm"
                                  onClick={() => window.print()}
                                  style={{ marginTop: '8px', width: 'fit-content' }}
                                >
                                  <Printer size={13} />
                                  Print Pass
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            }) : (
              <tr>
                <td colSpan={6}>
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <Search size={24} color="var(--text-dim)" />
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>No students found</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Try adjusting your search or filters</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Student Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="modal-head">
              <h3 className="modal-title">Register New Student</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">PIN / Roll Number *</label>
                <input type="text" className="form-control" placeholder="e.g. 23S01A5411"
                  value={formData.roll_number} required
                  onChange={e => setFormData({ ...formData, roll_number: e.target.value })} />
              </div>

              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input type="text" className="form-control" placeholder="e.g. BATTINA GOWTHAMI"
                  value={formData.name} required
                  onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>

              <div className="form-group">
                <label className="form-label">Department *</label>
                <select className="form-control" value={formData.department}
                  onChange={e => setFormData({ ...formData, department: e.target.value })}>
                  <option value="Artificial Intelligence & Data Science">Artificial Intelligence &amp; Data Science</option>
                  <option value="Computer Science & Engineering">Computer Science &amp; Engineering</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-control" placeholder="student@cist.ac.in"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <UserPlus size={15} />
                  Register & Generate QR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
