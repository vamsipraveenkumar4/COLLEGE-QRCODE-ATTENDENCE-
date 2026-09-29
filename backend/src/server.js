import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/apiRoutes.js';
import { initDb } from './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: '*', // Allow connections from Vite frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Mount API routes
app.use('/api', apiRoutes);

// Health check endpoints
app.get('/health', (req, res) => {
  res.json({ status: 'OK', system: 'College Barcode Attendance Backend', timestamp: new Date() });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', system: 'College Barcode Attendance Backend API', timestamp: new Date() });
});

// Root fallback endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ONLINE',
    message: 'College Barcode Attendance System API is running successfully!',
    endpoints: {
      health: '/api/health',
      students: '/api/students',
      courses: '/api/courses',
      attendanceLogs: '/api/attendance/logs',
      attendanceStats: '/api/attendance/stats'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
});

// Initialize database and start server
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 College Barcode Attendance API Server Running!`);
      console.log(`📡 Listening on: http://localhost:${PORT}`);
      console.log(`📊 API Base URL: http://localhost:${PORT}/api`);
      console.log(`====================================================`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server due to database initialization failure:', err);
  });
