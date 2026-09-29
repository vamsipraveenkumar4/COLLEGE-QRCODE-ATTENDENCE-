import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../../database.sqlite');

sqlite3.verbose();

export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database connection:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
  }
});

// Promisified helper methods for SQLite queries
export const dbQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

export const initDb = async () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Students table
      db.run(`
        CREATE TABLE IF NOT EXISTS students (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          qrcode_id TEXT UNIQUE NOT NULL,
          barcode_id TEXT,
          roll_number TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          department TEXT NOT NULL,
          email TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Courses table
      db.run(`
        CREATE TABLE IF NOT EXISTS courses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          code TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          department TEXT NOT NULL
        )
      `);

      // Attendance table
      db.run(`
        CREATE TABLE IF NOT EXISTS attendance (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          student_id INTEGER NOT NULL,
          course_id INTEGER NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          date TEXT NOT NULL,
          status TEXT CHECK(status IN ('PRESENT', 'LATE')) DEFAULT 'PRESENT',
          scan_method TEXT DEFAULT 'LAPTOP_CAMERA',
          FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE,
          FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
          UNIQUE(student_id, course_id, date)
        )
      `, (err) => {
        if (err) {
          console.error('Error initializing tables:', err);
          reject(err);
        } else {
          console.log('Database tables verified/created successfully.');
          resolve();
        }
      });
    });
  });
};
