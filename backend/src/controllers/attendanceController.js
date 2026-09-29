import { dbQuery, dbGet, dbRun } from '../config/db.js';

export const scanBarcode = async (req, res) => {
  try {
    const { barcode_id, qrcode_id, course_id, scan_method = 'WEBCAM' } = req.body;

    const targetCode = (qrcode_id || barcode_id || '').trim();

    if (!targetCode) {
      return res.status(400).json({ success: false, message: 'QR Code ID is required.' });
    }

    const targetCourseId = course_id || 1;

    // 1. Find Student by QR Code ID or Barcode ID / PIN NO
    const student = await dbGet('SELECT * FROM students WHERE qrcode_id = ? OR barcode_id = ? OR roll_number = ?', [targetCode, targetCode, targetCode]);
    if (!student) {
      return res.status(404).json({
        success: false,
        type: 'STUDENT_NOT_FOUND',
        message: `Unrecognized Student PIN / QR Code: "${targetCode}"`,
        qrcode_id: targetCode
      });
    }

    // 2. Check Course
    const course = await dbGet('SELECT * FROM courses WHERE id = ?', [targetCourseId]);
    const courseInfo = course || { id: 1, code: 'CSE101', name: 'General Lecture', department: 'Computer Science & Engineering' };

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const timestampStr = now.toISOString().replace('T', ' ').substring(0, 19);

    // 3. Check for Duplicate Scan Today
    const existingLog = await dbGet(
      'SELECT a.*, s.name as student_name FROM attendance a JOIN students s ON a.student_id = s.id WHERE a.student_id = ? AND a.course_id = ? AND a.date = ?',
      [student.id, courseInfo.id, todayStr]
    );

    if (existingLog) {
      return res.status(409).json({
        success: false,
        type: 'DUPLICATE_SCAN',
        message: `${student.name} (${student.roll_number}) has already marked today's attendance for ${courseInfo.code} at ${existingLog.timestamp.split(' ')[1] || existingLog.timestamp}.`,
        student,
        course: courseInfo,
        existingRecord: existingLog
      });
    }

    // Determine status (PRESENT vs LATE after 9:15 AM)
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const isLate = hours > 9 || (hours === 9 && minutes > 15);
    const status = isLate ? 'LATE' : 'PRESENT';

    // 4. Record Daily Attendance
    const result = await dbRun(
      'INSERT INTO attendance (student_id, course_id, timestamp, date, status, scan_method) VALUES (?, ?, ?, ?, ?, ?)',
      [student.id, courseInfo.id, timestampStr, todayStr, status, scan_method]
    );

    const record = await dbGet(
      `SELECT a.*, s.name as student_name, s.roll_number, s.department as student_dept, s.qrcode_id, c.code as course_code
       FROM attendance a
       JOIN students s ON a.student_id = s.id
       JOIN courses c ON a.course_id = c.id
       WHERE a.id = ?`,
      [result.id]
    );

    res.status(201).json({
      success: true,
      type: 'SCAN_SUCCESS',
      message: `Daily attendance successfully marked for ${student.name} (${status})`,
      data: record,
      student,
      course: courseInfo
    });
  } catch (error) {
    console.error('Scan QR code error:', error);
    res.status(500).json({ success: false, message: 'Server error processing camera QR scan', error: error.message });
  }
};

export const getAttendanceLogs = async (req, res) => {
  try {
    const { date, course_id, department, status, search } = req.query;

    let sql = `
      SELECT a.id, a.timestamp, a.date, a.status, a.scan_method,
             s.id as student_id, s.name as student_name, s.roll_number, s.qrcode_id, s.barcode_id, s.department as student_department, s.email,
             c.id as course_id, c.code as course_code, c.name as course_name
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      JOIN courses c ON a.course_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (date) {
      sql += ' AND a.date = ?';
      params.push(date);
    }
    if (course_id) {
      sql += ' AND a.course_id = ?';
      params.push(course_id);
    }
    if (department) {
      sql += ' AND s.department = ?';
      params.push(department);
    }
    if (status) {
      sql += ' AND a.status = ?';
      params.push(status);
    }
    if (search) {
      sql += ' AND (s.name LIKE ? OR s.roll_number LIKE ? OR s.qrcode_id LIKE ? OR s.barcode_id LIKE ?)';
      const queryStr = `%${search}%`;
      params.push(queryStr, queryStr, queryStr, queryStr);
    }

    sql += ' ORDER BY a.timestamp DESC';
    const logs = await dbQuery(sql, params);
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAttendanceStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const totalStudentsRow = await dbGet('SELECT COUNT(*) as count FROM students');
    const totalStudents = totalStudentsRow ? totalStudentsRow.count : 0;

    const todayScansRow = await dbGet('SELECT COUNT(*) as count FROM attendance WHERE date = ?', [today]);
    const scannedToday = todayScansRow ? todayScansRow.count : 0;

    const lateScansRow = await dbGet('SELECT COUNT(*) as count FROM attendance WHERE date = ? AND status = "LATE"', [today]);
    const lateToday = lateScansRow ? lateScansRow.count : 0;

    const presentToday = scannedToday - lateToday;
    const attendanceRate = totalStudents > 0 ? Math.round((scannedToday / totalStudents) * 100) : 0;

    // Scans by department today
    const departmentStats = await dbQuery(
      `SELECT s.department, COUNT(a.id) as count
       FROM attendance a
       JOIN students s ON a.student_id = s.id
       WHERE a.date = ?
       GROUP BY s.department`,
      [today]
    );

    // Recent 5 live scans
    const recentScans = await dbQuery(
      `SELECT a.id, a.timestamp, a.status, a.scan_method, s.name as student_name, s.roll_number, s.qrcode_id, c.code as course_code
       FROM attendance a
       JOIN students s ON a.student_id = s.id
       JOIN courses c ON a.course_id = c.id
       ORDER BY a.timestamp DESC LIMIT 5`
    );

    res.json({
      success: true,
      data: {
        totalStudents,
        scannedToday,
        presentToday,
        lateToday,
        absentToday: Math.max(0, totalStudents - scannedToday),
        attendanceRate,
        departmentStats,
        recentScans
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Export Attendance Sheet in Excel (.xlsx / .csv format compatible with Microsoft Excel)
export const exportAttendanceCSV = async (req, res) => {
  try {
    const { date } = req.query;
    const exportDate = date || new Date().toISOString().split('T')[0];

    let sql = `
      SELECT a.id, a.date, a.timestamp, a.status, a.scan_method,
             s.roll_number, s.name as student_name, s.department, s.qrcode_id,
             c.code as course_code, c.name as course_name
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      JOIN courses c ON a.course_id = c.id
    `;
    const params = [];
    if (date) {
      sql += ' WHERE a.date = ?';
      params.push(date);
    }
    sql += ' ORDER BY a.timestamp DESC';

    const records = await dbQuery(sql, params);

    // UTF-8 Byte Order Mark (BOM) so Excel automatically recognizes UTF-8 characters and columns cleanly
    let csv = '\uFEFF';
    csv += 'S.No,Attendance Date,Time Marked,PIN NO,Student Name,Department / Branch,Course Code,Course Name,Attendance Status,Capture Method\n';
    
    records.forEach((r, idx) => {
      csv += `"${idx + 1}","${r.date}","${r.timestamp}","${r.roll_number}","${r.student_name}","${r.department}","${r.course_code}","${r.course_name}","${r.status}","${r.scan_method}"\n`;
    });

    res.setHeader('Content-Type', 'application/vnd.ms-excel; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=CIST_Attendance_Report_${exportDate}.csv`);
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
