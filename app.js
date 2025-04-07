const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// Serve static files from the "TO-DOLIST" directory
app.use(express.static(path.join(__dirname, 'TO-DOLIST')));
app.use(cors());

// Middleware for parsing request bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// MySQL connection pool
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'nodejs_data',
});

// Serve HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'TO-DOLIST', 'todo.html'));
});

// Get all tasks
app.get('/tasks', (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(`Connected as ID: ${connection.threadId}`);

        connection.query('SELECT * FROM `to-do`', (err, rows) => {
            connection.release();

            if (!err) {
                res.json(rows);
            } else {
                console.error("Error fetching data:", err);
                res.status(500).send('Error fetching data.');
            }
        });
    });
});

// Get a task by ID
app.get('/tasks/:id', (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(`Connected as ID: ${connection.threadId}`);

        connection.query('SELECT * FROM `to-do` WHERE id = ?', [req.params.id], (err, rows) => {
            connection.release();

            if (!err) {
                res.json(rows);
            } else {
                console.error("Error fetching data:", err);
                res.status(500).send('Error fetching data.');
            }
        });
    });
});

// Delete a task by ID
app.delete('/tasks/:id', (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(`Connected as ID: ${connection.threadId}`);

        connection.query('DELETE FROM `to-do` WHERE id = ?', [req.params.id], (err, rows) => {
            connection.release();

            if (!err) {
                res.send(`To-do with the Record ID: ${req.params.id} has been removed.`);
            } else {
                console.error("Error deleting data:", err);
                res.status(500).send('Error deleting data.');
            }
        });
    });
});

// Add a new task
app.post('/tasks', (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(`Connected as ID: ${connection.threadId}`);

        const { name, description, status, due_date } = req.body;

        if (!name || !description || !status || !due_date) {
            res.status(400).send('All fields (name, description, status, due_date) are required.');
            return;
        }

        const sql = 'INSERT INTO `to-do` (name, description, status, due_date) VALUES (?, ?, ?, ?)';
        const values = [name, description, status, due_date];

        connection.query(sql, values, (err, result) => {
            connection.release();

            if (!err) {
                res.send(`To-do with the name: "${name}" has been added.`);
            } else {
                console.error("Error inserting data:", err);
                res.status(500).send('Error adding task.');
            }
        });

        console.log(req.body);
    });
});

// Update a task by ID
app.put('/tasks/:id', (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(`Connected as ID: ${connection.threadId}`);

        // Destructure the updated task data from the request body
        const { name, description, status, due_date } = req.body;

        // We will only update the fields that are provided
        const sql = 'UPDATE `to-do` SET name = ?, description = ?, status = ?, due_date = ? WHERE id = ?';
        const values = [name, description, status, due_date, req.params.id];

        connection.query(sql, values, (err, rows) => {
            connection.release();

            if (!err) {
                res.send(`To-do with the name: "${name}" has been updated.`);
            } else {
                console.error("Error updating data:", err);
                res.status(500).send('Error updating task.');
            }
        });

        console.log(req.body);
    });
});

// Start the server
app.listen(port, () => console.log(`Listening on port ${port}`));
