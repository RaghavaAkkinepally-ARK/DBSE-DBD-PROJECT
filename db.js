// Blood Bank Management System - Database Connection
// Using mysql2/promise for async/await support

const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelayMs: 0
});

// Test connection
pool.getConnection()
    .then(conn => {
        console.log('✓ MySQL Connected Successfully');
        conn.release();
    })
    .catch(err => {
        console.error('✗ MySQL Connection Error:', err.message);
    });

module.exports = pool;
