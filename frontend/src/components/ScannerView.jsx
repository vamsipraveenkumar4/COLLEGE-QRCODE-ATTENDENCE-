import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats, Html5Qrcode } from 'html5-qrcode';
import {
  Camera, QrCode, Zap, User, BookOpen, Download,
  Video, VideoOff, AlertTriangle, CheckCircle2, Clock, XCircle
} from 'lucide-react';
import { playSuccessBeep, playWarningBeep } from '../utils/audioSynth';

export default function ScannerView({ courses, onScanBarcode, lastScanResult, isProcessing, onExportCSV }) {
  const [selectedCourse, setSelectedCourse]     = useState('');
  const [manualBarcode, setManualBarcode]        = useState('');
  const [cameraPermission, setCameraPermission] = useState('prompt');
  const [isCameraActive, setIsCameraActive]     = useState(true);
  const [availableCameras, setAvailableCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [lastScannedCode, setLastScannedCode]   = useState('');

  useEffect(() => {
    if (courses && courses.length > 0 && !selectedCourse) {
      setSelectedCourse(courses[0].id);
    }
  }, [courses, selectedCourse]);

  useEffect(() => { requestLaptopCameraAccess(); }, []);

  const requestLaptopCameraAccess = async () => {
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setCameraPermission('granted');
        setIsCameraActive(true);
        stream.getTracks().forEach(t => t.stop());
        const devices = await Html5Qrcode.getCameras();
        if (devices?.length > 0) {
          setAvailableCameras(devices);
          setSelectedCameraId(devices[0].id);
        }
      } else {
        setCameraPermission('denied');
      }
    } catch {
      setCameraPermission('denied');
    }
  };

  // Hardware USB Scanner keyboard buffer
  useEffect(() => {
    let buffer = '';
    let tid = null;
    const handler = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;
      if (e.key === 'Enter') {
        if (buffer.trim().length >= 3) handleProcessScan(buffer.trim(), 'USB_HARDWARE_SCANNER');
        buffer = '';
      } else if (e.key.length === 1) {
        buffer += e.key;
        clearTimeout(tid);
        tid = setTimeout(() => { buffer = ''; }, 100);
      }
    };
    window.addEventListener('keydown', handler);
    return () => { window.removeEventListener('keydown', handler); clearTimeout(tid); };
  }, [selectedCourse]);

  // Live camera QR scanner
  useEffect(() => {
    let scanner = null;
    if (isCameraActive && cameraPermission === 'granted') {
      scanner = new Html5QrcodeScanner(
        'laptop-camera-reader',
        { fps: 15, qrbox: { width: 240, height: 240 }, formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE], rememberLastUsedCamera: true },
        false
      );
      scanner.render(
        (decoded) => {
          if (decoded !== lastScannedCode) {
            setLastScannedCode(decoded);
            handleProcessScan(decoded, 'LAPTOP_CAMERA');
            setTimeout(() => setLastScannedCode(''), 3000);
          }
        },
        () => {}
      );
    }
    return () => { if (scanner) scanner.clear().catch(() => {}); };
  }, [isCameraActive, cameraPermission, selectedCourse]);

  const handleProcessScan = async (codeId, scanMethod = 'LAPTOP_CAMERA') => {
    if (!codeId) return;
    const res = await onScanBarcode(codeId, selectedCourse, scanMethod);
    if (res?.success) playSuccessBeep(); else playWarningBeep();
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      handleProcessScan(manualBarcode.trim(), 'MANUAL_PIN_ENTRY');
      setManualBarcode('');
    }
  };

  const quickTestQrCodes = [
    { label: 'BATTINA GOWTHAMI',  code: '23S01A5401' },
    { label: 'JAGADAM DHARANI',   code: '23S01A5403' },
    { label: 'BANDHILI DEEPIKA',  code: '23S01A0501' },
    { label: 'MADIKI NAVYA',      code: '23S01A0537' },
    { label: 'PADAMATI SWARUPA',  code: '24S05A5402' },
  ];

  // Derive scan result state
  const resultState = !lastScanResult
    ? null
    : lastScanResult.success
      ? lastScanResult.data?.status === 'LATE' ? 'late' : 'present'
      : lastScanResult.type === 'DUPLICATE_SCAN' ? 'late' : 'error';

  return (
    <div className="scanner-layout">

      {/* ── Left: Camera & Controls ── */}
      <div className="card scanner-panel">

        {/* Course selector + camera toggle */}
        <div className="flex items-center justify-between gap-3" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-input)', padding: '8px 14px', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', flex: 1 }}>
            <BookOpen size={16} color="var(--blue)" />
            <select
              className="form-control"
              value={selectedCourse}
              onChange={e => setSelectedCourse(e.target.value)}
              style={{ border: 'none', padding: '0', background: 'transparent', fontSize: '0.875rem', fontWeight: 600 }}
            >
              {courses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.code}: {c.name} ({c.department})
                </option>
              ))}
            </select>
          </div>

          <button
            className={isCameraActive ? 'btn btn-success btn-sm' : 'btn btn-ghost btn-sm'}
            onClick={() => cameraPermission !== 'granted' ? requestLaptopCameraAccess() : setIsCameraActive(v => !v)}
          >
            {isCameraActive ? <Video size={15} /> : <VideoOff size={15} />}
            {isCameraActive ? 'Camera Active' : 'Start Camera'}
          </button>
        </div>

        {/* Camera status banner */}
        <div className={`status-banner ${cameraPermission === 'granted' && isCameraActive ? 'connected' : 'warning'}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="status-pulse" style={{
              background: cameraPermission === 'granted' && isCameraActive ? 'var(--success)' : 'var(--warning)',
              animation: cameraPermission === 'granted' && isCameraActive ? undefined : 'none',
            }} />
            <span style={{ fontSize: '0.82rem' }}>
              {cameraPermission === 'granted' && isCameraActive
                ? 'Camera Live • Point student QR pass at screen'
                : cameraPermission === 'denied'
                  ? 'Camera permission denied — allow in browser settings'
                  : 'Click "Start Camera" to enable live detection'}
            </span>
          </div>
          {availableCameras.length > 1 && (
            <select
              value={selectedCameraId}
              onChange={e => setSelectedCameraId(e.target.value)}
              className="form-control"
              style={{ padding: '3px 8px', fontSize: '0.75rem', width: 'auto' }}
            >
              {availableCameras.map((cam, i) => (
                <option key={cam.id} value={cam.id}>{cam.label || `Camera ${i + 1}`}</option>
              ))}
            </select>
          )}
        </div>

        {/* Camera viewport */}
        {cameraPermission === 'granted' && isCameraActive ? (
          <div style={{ borderRadius: 'var(--r-lg)', overflow: 'hidden', minHeight: '300px' }}>
            <div id="laptop-camera-reader" />
          </div>
        ) : (
          <div className="camera-box" style={{ minHeight: '260px' }}>
            <div className="laser-scan" />
            <AlertTriangle size={48} color="var(--warning)" style={{ marginBottom: '14px', position: 'relative', zIndex: 10 }} />
            <h3 style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 700, position: 'relative', zIndex: 10 }}>
              Camera Access Required
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', textAlign: 'center', marginTop: '6px', maxWidth: '340px', position: 'relative', zIndex: 10 }}>
              Grant camera permission to enable live QR detection
            </p>
            <button className="btn btn-primary" onClick={requestLaptopCameraAccess} style={{ marginTop: '18px', position: 'relative', zIndex: 10 }}>
              <Camera size={15} />
              Allow Camera Access
            </button>
          </div>
        )}

        {/* Manual / USB input */}
        <form onSubmit={handleManualSubmit}>
          <div className="usb-bar">
            <QrCode size={20} color="var(--text-dim)" style={{ flexShrink: 0, margin: 'auto 0' }} />
            <input
              type="text"
              className="usb-input"
              placeholder="Manual PIN / USB scanner input (e.g. 23S01A5401)…"
              value={manualBarcode}
              onChange={e => setManualBarcode(e.target.value)}
            />
            <button type="submit" className="btn btn-primary btn-sm" disabled={isProcessing} style={{ flexShrink: 0 }}>
              <Zap size={14} />
              {isProcessing ? 'Marking…' : 'Mark Entry'}
            </button>
          </div>
        </form>

        {/* Quick test chips */}
        <div className="quick-section">
          <div className="quick-label">⚡ Quick Test QR Simulator (CIST Students)</div>
          <div className="chip-row">
            {quickTestQrCodes.map(item => (
              <button
                key={item.code}
                type="button"
                className="chip"
                onClick={() => handleProcessScan(item.code, 'SIMULATOR')}
              >
                {item.label}
                <span style={{ opacity: 0.6, fontSize: '0.7rem' }}>({item.code})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: Result + Export ── */}
      <div className="card result-panel">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="card-title">
            <div className="card-icon cyan"><Zap size={18} /></div>
            Live Verification
          </div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => onExportCSV(new Date().toISOString().split('T')[0])}
            style={{ color: 'var(--success)', borderColor: 'var(--success-border)', background: 'var(--success-dim)' }}
          >
            <Download size={14} />
            Export Excel
          </button>
        </div>

        {/* Scan result */}
        {lastScanResult ? (
          <div className={`scan-result-card ${resultState}`} style={{ animation: 'slideUp 0.22s ease' }}>
            {/* Header badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span className={`badge ${
                resultState === 'present' ? 'badge-present'
                : resultState === 'late'    ? 'badge-late'
                : 'badge-error'
              }`}>
                {lastScanResult.success
                  ? lastScanResult.data?.status
                  : lastScanResult.type === 'DUPLICATE_SCAN'
                    ? 'DUPLICATE'
                    : 'NOT FOUND'}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                {lastScanResult.data?.timestamp || new Date().toLocaleTimeString()}
              </span>
            </div>

            {lastScanResult.student ? (
              <>
                {/* Student identity */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div className="student-avatar-lg">
                    {lastScanResult.student.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                      {lastScanResult.student.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
                      PIN: <span className="text-mono text-cyan">{lastScanResult.student.roll_number}</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                      {lastScanResult.student.department}
                    </div>
                  </div>
                </div>

                {/* Meta grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
                  {[
                    { label: 'Course',  value: lastScanResult.course?.code || '—' },
                    { label: 'Method',  value: lastScanResult.data?.scan_method || 'CAMERA' },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', marginTop: '2px' }}>{value}</div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <XCircle size={44} color="var(--danger)" style={{ margin: '0 auto 10px' }} />
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Unrecognized QR Code</div>
              </div>
            )}

            {/* Message */}
            <div style={{ marginTop: '14px', padding: '10px 14px', background: 'rgba(0,0,0,0.30)', borderRadius: 'var(--r-sm)', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              {lastScanResult.message}
            </div>
          </div>
        ) : (
          <div className="empty-state" style={{ padding: '48px 20px', border: '1px dashed var(--border)', borderRadius: 'var(--r-lg)' }}>
            <div className="empty-state-icon">
              <User size={28} color="var(--text-dim)" />
            </div>
            <p className="fw-700" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Ready to Scan</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textAlign: 'center' }}>
              Hold a student QR pass up to the camera — attendance marks automatically
            </p>
          </div>
        )}

        {/* Export footer */}
        <div style={{ marginTop: 'auto', padding: '14px 16px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>Export Today's Sheet</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>S.No, PIN, Name &amp; Time — Excel format</div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => onExportCSV(new Date().toISOString().split('T')[0])}>
            <Download size={14} />
            .xlsx
          </button>
        </div>
      </div>
    </div>
  );
}
