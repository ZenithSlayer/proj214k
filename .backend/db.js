const mysql = require("mysql2");
require("dotenv").config();

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "projeto22026",
};

let db;
let isRetrying = false;

function handleDisconnect() {
  db = mysql.createConnection(dbConfig);

  db.connect((err) => {
    if (err) {
      console.error("Database connection failed:", err.message);
      if (!isRetrying) {
        isRetrying = true;
        console.log("Retrying connection in 5 seconds...");
        setTimeout(() => {
          isRetrying = false;
          handleDisconnect();
        }, 5000);
      }
    } else {
      console.log("Connected to MySQL/MariaDB successfully!");
    }
  });

  db.on("error", (err) => {
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      console.log("Database connection lost. Reconnecting...");
      handleDisconnect();
    } else if (err.code !== "ECONNREFUSED") {
      throw err;
    }
  });
}

handleDisconnect();

module.exports = {
  query: (sql, args, callback) => {
    return db.query(sql, args, callback);
  }
};