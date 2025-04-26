require('dotenv').config(); // Load environment variables

const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",      
    user: process.env.DB_USER || "root",           
    password: process.env.DB_PASSWORD || "sakshi@12345",       
    database: process.env.DB_NAME || "campus_network", 
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

async function checkConnection() {
    try {
        const connection = await pool.getConnection();
        console.log("✅ MySQL Connected!");
        connection.release(); // Release the connection after checking
    } catch (err) {
        console.error("❌ MySQL Connection Error:", err.message);
    }
}

checkConnection();

module.exports = pool;  // Export the pool for use in other files
