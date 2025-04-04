const mysql = require('mysql2');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'tarun@1924', // your MySQL password
  database: 'campus_network',
});

connection.connect((err) => {
  if (err) throw err;
  console.log('MySQL connected!');
});

module.exports = connection;
