import * as mariadb from "mariadb";

const pool = mariadb.createPool({
  host:     process.env.DB_HOST     || "127.0.0.1",
  port:     Number(process.env.DB_PORT) || 3306,
  user:     process.env.DB_USER     || "quizuser",
  password: process.env.DB_PASSWORD || "quizpass",
  database: process.env.DB_NAME     || "Evaluacion",
  connectionLimit: 5,
  connectTimeout:  10000,
});

export default pool;