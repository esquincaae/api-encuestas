const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const port = 3001;

const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'user',
  password: 'password',
  database: 'loginDB'
});

db.connect(err => {
  if (err) throw err;
  console.log('Conectado a la base de datos');

  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        nombre_de_usuario VARCHAR(255) NOT NULL,
        numero_de_telefono VARCHAR(255) NOT NULL
    )
  `;

  db.query(createTableQuery, (err, result) => {
    if (err) throw err;
    console.log("Tabla 'users' creada o ya existente");
  });
});

app.use(cors());
app.use(bodyParser.json());

app.post('/register', (req, res) => {
  const { email, password, nombre_de_usuario, numero_de_telefono } = req.body;
  const query = 'INSERT INTO users (email, password, nombre_de_usuario, numero_de_telefono) VALUES (?, ?, ?, ?)';

  db.query(query, [email, nombre_de_usuario, numero_de_telefono, password], (err, results) => {
    if (err) {
      res.status(500).json({ message: 'Error al registrar usuario', error: err });
    } else {
      res.status(200).json({ message: 'Usuario registrado exitosamente' });
    }
  });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const query = 'SELECT * FROM users WHERE email = ? AND password = ?';

  db.query(query, [email, password], (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      res.status(200).json({ message: 'Inicio de sesión exitoso' });
    } else {
      res.status(401).json({ message: 'Credenciales inválidas' });
    }
  });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
