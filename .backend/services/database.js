const db = require("../db");

const query = (sql, params = []) => new Promise((resolve, reject) => {
  db.query(sql, params, (error, results) => {
    if (error) reject(error);
    else resolve(results);
  });
});

module.exports = { query };
