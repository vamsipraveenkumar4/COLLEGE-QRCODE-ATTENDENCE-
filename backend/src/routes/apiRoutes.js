import express from 'express';
import { getStudents, getStudentByBarcode, createStudent, deleteStudent } from '../controllers/studentController.js';
import { getCourses, createCourse } from '../controllers/courseController.js';
import { scanBarcode, getAttendanceLogs, getAttendanceStats, exportAttendanceCSV } from '../controllers/attendanceController.js';

const router = express.Router();

// Student Routes
router.get('/students', getStudents);
router.get('/students/barcode/:barcodeId', getStudentByBarcode);
router.post('/students', createStudent);
router.delete('/students/:id', deleteStudent);

// Course Routes
router.get('/courses', getCourses);
router.post('/courses', createCourse);

// Attendance Routes
router.post('/attendance/scan', scanBarcode);
router.get('/attendance/logs', getAttendanceLogs);
router.get('/attendance/stats', getAttendanceStats);
router.get('/attendance/export', exportAttendanceCSV);

export default router;
