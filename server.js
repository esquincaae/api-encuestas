const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const port = 3001;

const dbConfig = {
  host: '127.0.0.1',
  user: 'root',
  password: ''
};

const dbName = 'encuestasDB';

const db = mysql.createConnection(dbConfig);

db.connect(err => {
  if (err) throw err;
  console.log('Conectado a MySQL');

  db.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`, (err, result) => {
    if (err) throw err;
    console.log(`Base de datos '${dbName}' creada o ya existente`);
    db.changeUser({database : dbName}, (err) => {
      if (err) throw err;

      const createUsersTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) NOT NULL,
          password VARCHAR(255) NOT NULL,
          nombre_de_usuario VARCHAR(255) NOT NULL,
          numero_de_telefono VARCHAR(255) NOT NULL
        )
      `;

      const createSurveysTableQuery = `
        CREATE TABLE IF NOT EXISTS surveys (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          user_id INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `;

      db.query(createUsersTableQuery, (err, result) => {
        if (err) throw err;
        console.log("Tabla 'users' creada o ya existente");
      });

      db.query(createSurveysTableQuery, (err, result) => {
        if (err) throw err;
        console.log("Tabla 'surveys' creada o ya existente");
      });
    });
  });
});

app.use(cors());
app.use(bodyParser.json());

app.post('/register', (req, res) => {
  const { email, password, nombre_de_usuario, numero_de_telefono } = req.body;
  const query = 'INSERT INTO users (email, password, nombre_de_usuario, numero_de_telefono) VALUES (?, ?, ?, ?)';

  db.query(query, [email, password, nombre_de_usuario, numero_de_telefono], (err, results) => {
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
    if (err) {
      res.status(500).json({ message: 'Error al iniciar sesión', error: err });
    } else if (results.length > 0) {
      res.status(200).json({ message: 'Inicio de sesión exitoso', user: results[0] });
    } else {
      res.status(401).json({ message: 'Credenciales inválidas' });
    }
  });
});

app.post('/surveys', (req, res) => {
  const { title, description, user_id } = req.body;
  const query = 'INSERT INTO surveys (title, description, user_id) VALUES (?, ?, ?)';

  db.query(query, [title, description, user_id], (err, results) => {
    if (err) {
      res.status(500).json({ message: 'Error al crear la encuesta', error: err });
    } else {
      res.status(200).json({ message: 'Encuesta creada exitosamente' });
    }
  });
});

app.get('/surveys', (req, res) => {
  const query = 'SELECT * FROM surveys';

  db.query(query, (err, results) => {
    if (err) {
      res.status(500).json({ message: 'Error al obtener las encuestas', error: err });
    } else {
      res.status(200).json(results);
    }
  });
});

app.get('/user/:userId/surveys', (req, res) => {
  const { userId } = req.params;
  const query = 'SELECT * FROM surveys WHERE user_id = ?';

  db.query(query, [userId], (err, results) => {
    if (err) {
      res.status(500).json({ message: 'Error al obtener las encuestas del usuario', error: err });
    } else {
      res.status(200).json(results);
    }
  });
});

app.get('/surveys/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM surveys WHERE id = ?';

  db.query(query, [id], (err, results) => {
    if (err) {
      res.status(500).json({ message: 'Error al obtener la encuesta', error: err });
    } else if (results.length > 0) {
      res.status(200).json(results[0]);
    } else {
      res.status(404).json({ message: 'Encuesta no encontrada' });
    }
  });
});

app.put('/surveys/:id', (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;
  const query = 'UPDATE surveys SET title = ?, description = ? WHERE id = ?';

  db.query(query, [title, description, id], (err, results) => {
    if (err) {
      res.status(500).json({ message: 'Error al actualizar la encuesta', error: err });
    } else {
      res.status(200).json({ message: 'Encuesta actualizada exitosamente' });
    }
  });
});

app.delete('/surveys/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM surveys WHERE id = ?';

  db.query(query, [id], (err, results) => {
    if (err) {
      res.status(500).json({ message: 'Error al eliminar la encuesta', error: err });
    } else {
      res.status(200).json({ message: 'Encuesta eliminada exitosamente' });
    }
  });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
