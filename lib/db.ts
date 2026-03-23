require('dotenv').config();
const mariadb = require('mariadb');

const pool = mariadb.createPool({
  host: process.env.DB_PORT || 3306 ,
  user: process.env.DB_USER || 'root', 
  password: process.env.PASSWORD || 'root',
  database: process.env.NAME || 'Evaluacion', 
});

export default pool;