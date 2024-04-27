const express = require('express');
const bodyParser = require('body-parser');
const mssql = require('mssql');
 
const app = express();
const port = 3000;

require('dotenv').config();
 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
 
/*const config = {
    user: 'rziller',
    password: 'abc123..',
    //server: 'LAPTOP-JH3OE1OM', // Puede ser una dirección IP o un nombre de dominio
    server: 'localhost',
    database: 'Papeleria',
    options: {
        
        trustServerCertificate: true
    }
};*/

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
      trustServerCertificate: true
  }
};
 
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/login.html');
  });
   
  app.post('/login', async (req, res) => {
    try {
      const { usuario, contraseña } = req.body;
      await mssql.connect(config);
      const result = await mssql.query`SELECT * FROM Usuarios WHERE nombre_usuario = ${usuario} AND contrasena = ${contraseña}`;
      if (result.recordset.length > 0) {
        const usuarioId = result.recordset[0].id;
        res.redirect(`/bienvenida/${usuarioId}`);
      } else {
        res.status(401).send('Credenciales incorrectas');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Error interno del servidor');
    }
  });

  app.get('/registro', (req, res) => {
    res.sendFile(__dirname + '/registro.html');
  });

  app.post('/registro', async (req, res) => {
    try {
      const { usuario, contraseña } = req.body;
      await mssql.connect(config);
      await mssql.query`INSERT INTO Usuarios (nombre_usuario, contrasena) VALUES (${usuario}, ${contraseña})`;
      res.send('Usuario registrado correctamente');
    } catch (error) {
      console.error(error);
      res.status(500).send('Error interno del servidor');
    }
  });
   
   
  app.get('/bienvenida/:usuarioId', async (req, res) => {
    try {
      const usuarioId = req.params.usuarioId;
      await mssql.connect(config);
      const result = await mssql.query`SELECT * FROM Usuarios WHERE id = ${usuarioId}`;
      const nombreUsuario = result.recordset[0].nombre_usuario;
      res.send(`Bienvenido, ${nombreUsuario}!<br><a href="/orden/${usuarioId}">Crear una orden</a>`);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error interno del servidor');
    }
  });
   
  app.get('/orden/:usuarioId', (req, res) => {
    const usuarioId = req.params.usuarioId;
    //console.log(usuarioId);
    
    if (isNaN(usuarioId)) {
      return res.status(400).send('ID de usuario inválido aca aca');
    }
    
    res.sendFile(__dirname + '/orden.html');
  });
   
  app.post('/orden/:usuarioId', async (req, res) => {
    try {
      const { tipoOrden, cantidad } = req.body;
      console.log(req.body);
      console.log(req.params);
      console.log(req.query);
      const usuarioId = req.body.usuarioId;
      
      if (isNaN(usuarioId)) {
        return res.status(400).send('ID de usuario inválido acax');
      }
   
      await mssql.connect(config);
      await mssql.query`INSERT INTO Ordenes (id_usuario, tipo_orden, cantidad) VALUES (${usuarioId}, ${tipoOrden}, ${cantidad})`;
      res.redirect(`/ordenexito/${usuarioId}`);
      //res.send(`Orden colocada correctamente <br><a href="/orden/${usuarioId}">Regresar</a>`);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error interno del servidor');
    }
  });

  // Ruta para mostrar la página de éxito
app.get('/ordenexito/:usuarioId', (req, res) => {
    const usuarioId = req.params.usuarioId;
    res.send(`Orden colocada correctamente <br><a href="/orden/${usuarioId}">Regresar</a>`);
  });
   
  app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
  });