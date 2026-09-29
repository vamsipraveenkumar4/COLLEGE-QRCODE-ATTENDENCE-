import { dbQuery, dbGet, dbRun } from '../config/db.js';

export const getStudents = async (req, res) => {
  try {
    const { department, search } = req.query;
    let sql = 'SELECT * FROM students WHERE 1=1';
    const params = [];

    if (department) {
      sql += ' AND department = ?';
      params.push(department);
    }
    if (search) {
      sql += ' AND (name LIKE ? OR roll_number LIKE ? OR qrcode_id LIKE ? OR barcode_id LIKE ?)';
      const queryStr = `%${search}%`;
      params.push(queryStr, queryStr, queryStr, queryStr);
    }

    sql += ' ORDER BY roll_number ASC';
    const students = await dbQuery(sql, params);
    res.json({ success: true, data: students });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getStudentByBarcode = async (req, res) => {
  try {
    const { barcodeId } = req.params;
    const student = await dbGet('SELECT * FROM students WHERE qrcode_id = ? OR barcode_id = ?', [barcodeId, barcodeId]);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found with this QR / Barcode ID.' });
    }
    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createStudent = async (req, res) => {
  try {
    const { roll_number, name, department, email } = req.body;

    if (!roll_number || !name || !department) {
      return res.status(400).json({ success: false, message: 'Roll number, name, and department are required.' });
    }

    // Auto-generate QR Code ID
    const qrcode_id = `QR${Date.now().toString().slice(-6)}${Math.floor(10 + Math.random() * 90)}`;

    const result = await dbRun(
      'INSERT INTO students (qrcode_id, barcode_id, roll_number, name, department, email) VALUES (?, ?, ?, ?, ?, ?)',
      [qrcode_id, qrcode_id, roll_number, name, department, email || '']
    );

    const newStudent = await dbGet('SELECT * FROM students WHERE id = ?', [result.id]);
    res.status(201).json({ success: true, message: 'Student created successfully with QR Code Pass', data: newStudent });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ success: false, message: 'Roll number or QR Code already exists.' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    await dbRun('DELETE FROM students WHERE id = ?', [id]);
    res.json({ success: true, message: 'Student deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
