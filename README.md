# 🎓 College Barcode & QR Code Attendance Management System

An automated, modern web-based attendance tracking platform designed for colleges and universities. It allows rapid attendance logging via camera QR scanning, USB barcode scanner input, real-time statistics dashboard, student profile management with printable QR ID passes, and CSV export.

---

## 🚀 Features

- **⚡ Fast Barcode & QR Code Scanning**:
  - Live video camera scanner (HTML5 QR Code)
  - USB hardware barcode reader emulation / chip simulation
  - Instant duplicate prevention & feedback sound/alerts
- **📊 Real-time Dashboard**:
  - Live attendance percentages and stats (Present / Late / Absent)
  - Department-wise breakdown
  - Live activity feed
- **👥 Student Management**:
  - Add & manage students with Department, Roll Number, and Email
  - Generates unique QR & Barcodes for every student
  - Printable student ID pass card
- **📋 Attendance Logs & Reports**:
  - Filter logs by date, course, or student
  - 1-click CSV export for reports

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Lucide Icons, Vanilla CSS (responsive, dark/light theme accents)
- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **QR Engine**: html5-qrcode, qrcode.react

---

## 📦 Getting Started

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
```
The backend API runs on `http://localhost:5000`

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.
