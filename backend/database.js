const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database file
const db = new sqlite3.Database(path.join(__dirname, 'todo.db'));

// Create table (this is the "database" part - 1 table with all features)
db.run(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'pending'
  )
`);

module.exports = db;