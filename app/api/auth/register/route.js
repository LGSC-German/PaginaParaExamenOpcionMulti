const {pool} = require("./lib/db");

async function insertarUsuario(nombre, passwd) {
  let conn;
  try {
    conn = await pool.postConnection();
    const res = await conn.query("INSERT INTO usuarios(nombre, edad) VALUES (?, ?)", [nombre, edad]);
    console.log("Usuario insertado con ID:", res.insertId);
  } catch (err) {
    console.error(err);
  } finally {
    if (conn) conn.release(); 
  }
}
