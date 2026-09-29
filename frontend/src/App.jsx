import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ScannerView from './components/ScannerView';
import DashboardView from './components/DashboardView';
import StudentsView from './components/StudentsView';
import LogsView from './components/LogsView';

const API_BASE = '/api';

export default function App() {
  const [activeTab, setActiveTab]       = useState('scanner');
  const [isConnected, setIsConnected]   = useState(false);
  const [courses, setCourses]           = useState([]);
  const [students, setStudents]         = useState([]);
  const [logs, setLogs]                 = useState([]);
  const [stats, setStats]               = useState(null);
  const [lastScanResult, setLastScanResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [clock, setClock]               = useState('');

  // Live clock
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    fetchInitialData();
    const id = setInterval(fetchInitialData, 10000);
    return () => clearInterval(id);
  }, []);

  const fetchInitialData = async () => {
    try {
      const [coursesRes, studentsRes, logsRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/courses`).then(r => r.json()),
        fetch(`${API_BASE}/students`).then(r => r.json()),
        fetch(`${API_BASE}/attendance/logs`).then(r => r.json()),
        fetch(`${API_BASE}/attendance/stats`).then(r => r.json()),
      ]);
      if (coursesRes.success) setCourses(coursesRes.data);
      if (studentsRes.success) setStudents(studentsRes.data);
      if (logsRes.success) setLogs(logsRes.data);
      if (statsRes.success) setStats(statsRes.data);
      setIsConnected(true);
    } catch {
      setIsConnected(false);
    }
  };

  const handleScanBarcode = async (barcode_id, course_id, scan_method = 'WEBCAM') => {
    setIsProcessing(true);
    try {
      const res = await fetch(`${API_BASE}/attendance/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode_id, course_id, scan_method }),
      });
      const data = await res.json();
      setLastScanResult(data);
      fetchInitialData();
      return data;
    } catch {
      const err = { success: false, type: 'SERVER_ERROR', message: 'Network error.' };
      setLastScanResult(err);
      return err;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddStudent = async (studentData) => {
    try {
      const res = await fetch(`${API_BASE}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData),
      });
      const data = await res.json();
      fetchInitialData();
      return data;
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('Delete this student record?')) return;
    try {
      await fetch(`${API_BASE}/students/${studentId}`, { method: 'DELETE' });
      fetchInitialData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportCSV = (date) => {
    const q = date ? `?date=${date}` : '';
    window.open(`${API_BASE}/attendance/export${q}`, '_blank');
  };

  const PAGE_TITLES = {
    scanner:   { title: 'QR Scanner',        sub: 'Real-time attendance marking via camera or USB scanner' },
    dashboard: { title: 'Dashboard',          sub: 'Today\'s overview and live scan activity' },
    students:  { title: 'Student Directory',  sub: 'Manage students and generate QR passes' },
    logs:      { title: 'Attendance Logs',    sub: 'Full audit history with filters and CSV export' },
  };

  const page = PAGE_TITLES[activeTab];

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isConnected={isConnected}
        studentCount={students.length}
        logCount={logs.length}
      />

      {/* Main Content */}
      <div className="main-content">
        {/* Topbar */}
        <div className="topbar">
          <div>
            <div className="topbar-title">{page.title}</div>
            <div className="topbar-subtitle">{page.sub}</div>
          </div>
          <div className="topbar-right">
            <span className="topbar-time">{clock}</span>
          </div>
        </div>

        {/* Page Content */}
        <div className="page-content">
          {activeTab === 'scanner' && (
            <ScannerView
              courses={courses}
              onScanBarcode={handleScanBarcode}
              lastScanResult={lastScanResult}
              isProcessing={isProcessing}
              onExportCSV={handleExportCSV}
            />
          )}
          {activeTab === 'dashboard' && <DashboardView stats={stats} />}
          {activeTab === 'students' && (
            <StudentsView
              students={students}
              onAddStudent={handleAddStudent}
              onDeleteStudent={handleDeleteStudent}
              onRefresh={fetchInitialData}
            />
          )}
          {activeTab === 'logs' && (
            <LogsView
              logs={logs}
              courses={courses}
              onExportCSV={handleExportCSV}
              onRefreshLogs={fetchInitialData}
            />
          )}
        </div>
      </div>
    </div>
  );
}
