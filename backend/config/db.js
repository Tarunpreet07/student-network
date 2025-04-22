require('dotenv').config(); // ✅ Load environment variables

const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",      // ✅ from .env
    user: process.env.DB_USER || "root",           // ✅ from .env
    password: process.env.DB_PASSWORD || "tarun@1924",       // ✅ from .env
    database: process.env.DB_NAME || "campus_network", // ✅ from .env
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// ✅ Check MySQL Connection
async function checkConnection() {
    try {
        const connection = await pool.getConnection();
        console.log("✅ MySQL Connected!");
        connection.release(); // Release the connection after checking
    } catch (err) {
        console.error("❌ MySQL Connection Error:", err.message);
    }
}

// Call the function to check MySQL connection
checkConnection();

module.exports = pool;
