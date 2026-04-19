const express = require('express');
const mysql = require('mysql2');
const app = express();
const PORT = 3000;

app.use(express.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

const pool = mysql.createPool({
    host: 'database',
    user: 'todo_user',
    password: 'todo_pass',
    database: 'todoapp',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

function initDB() {
    pool.query(`
        CREATE TABLE IF NOT EXISTS tasks (
            id INT PRIMARY KEY AUTO_INCREMENT,
            title VARCHAR(255) NOT NULL,
            status VARCHAR(50) DEFAULT 'pending'
        )
    `, (err) => {
        if (err) {
            console.log('DB not ready, retrying in 5 seconds...');
            setTimeout(initDB, 5000);
        } else {
            console.log('Connected to MySQL! Tasks table ready.');
        }
    });
}

initDB();

app.get('/api/tasks', (req, res) => {
    pool.query('SELECT * FROM tasks', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/tasks', (req, res) => {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: 'Title required' });
    pool.query('INSERT INTO tasks (title) VALUES (?)', [title], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.put('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    pool.query('UPDATE tasks SET status = ? WHERE id = ?', [status, id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.delete('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    pool.query('DELETE FROM tasks WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});