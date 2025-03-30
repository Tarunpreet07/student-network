const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root", // Change if you have a different username
  password: "tarun@1924", // Add your MySQL password
  database: "campus_network" // Change this to your database name
});

db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed: " + err.message);
  } else {
    console.log("✅ Connected to MySQL database!");
  }
});

module.exports = db;
