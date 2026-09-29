import { dbQuery, dbRun, dbGet } from '../config/db.js';

export const getCourses = async (req, res) => {
  try {
    const courses = await dbQuery('SELECT * FROM courses ORDER BY code ASC');
    res.json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createCourse = async (req, res) => {
  try {
    const { code, name, department } = req.body;
    if (!code || !name || !department) {
      return res.status(400).json({ success: false, message: 'Course code, name, and department are required.' });
    }

    const result = await dbRun(
      'INSERT INTO courses (code, name, department) VALUES (?, ?, ?)',
      [code.toUpperCase(), name, department]
    );

    const newCourse = await dbGet('SELECT * FROM courses WHERE id = ?', [result.id]);
    res.status(201).json({ success: true, message: 'Course created successfully', data: newCourse });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ success: false, message: 'Course code already exists.' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};
