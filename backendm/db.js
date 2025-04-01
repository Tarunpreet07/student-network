const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: "localhost",  // Change if needed
    user: "root",  // Your MySQL username
    password: "tarun@1924",  // Your MySQL password
    database: "campus_network",  // Your database name
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// ✅ Check MySQL Connection
pool.getConnection()
    .then((connection) => {
        console.log("✅ MySQL Connected!");
        connection.release();
    })
    .catch((err) => console.error("❌ MySQL Connection Error:", err.message));

module.exports = pool;
