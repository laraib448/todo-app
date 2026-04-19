const express = require('express');
const mysql = require('mysql2');
const app = express();
const PORT = 3000;

app.use(express.json());

// ============ DATABASE: MySQL ============
let db;

function connectWithRetry() {
    db = mysql.createConnection({
        host: 'database',
        user: 'todo_user',
        password: 'todo_pass',
        database: 'todoapp'
    });

    db.connect((err) => {
        if (err) {
            console.log('MySQL not ready, retrying in 5 seconds...');
            setTimeout(connectWithRetry, 5000);
        } else {
            console.log('Connected to MySQL!');
            createTable();
        }
    });

    db.on('error', (err) => {
        console.log('DB error:', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            connectWithRetry();
        }
    });
}

function createTable() {
    db.query(`
        CREATE TABLE IF NOT EXISTS tasks (
            id INT PRIMARY KEY AUTO_INCREMENT,
            title VARCHAR(255) NOT NULL,
            status VARCHAR(50) DEFAULT 'pending'
        )
    `, (err) => {
        if (err) console.error('Table creation error:', err);
        else console.log('Tasks table ready');
    });
}

connectWithRetry();

// ============ API ENDPOINTS ============

// Get all tasks
app.get('/api/tasks', (req, res) => {
    if (!db) return res.status(500).json({ error: 'DB not connected' });
    db.query('SELECT * FROM tasks', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Add new task
app.post('/api/tasks', (req, res) => {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: 'Title required' });
    db.query('INSERT INTO tasks (title) VALUES (?)', [title], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// Update task status
app.put('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    db.query('UPDATE tasks SET status = ? WHERE id = ?', [status, id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// Delete task
app.delete('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM tasks WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});