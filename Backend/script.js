const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./usuarios.db');

async function registrar(usuario, claveLimpia) {
    const saltRounds = 10; // Nivel de seguridad
    
    // 1. Hasheamos la clave
    const hash = await bcrypt.hash(claveLimpia, saltRounds);
    
    // 2. Guardamos el hash, NO la clave original
    const sql = `INSERT INTO usuarios (username, password) VALUES (?, ?)`;
    
    db.run(sql, [usuario, hash], (err) => {
        if (err) return console.error("Error al registrar:", err.message);
        console.log(`Usuario ${usuario} creado con éxito (y clave protegida).`);
    });
}
async function login(usuario, claveIntento) {
    const sql = `SELECT password FROM usuarios WHERE username = ?`;
    
    db.get(sql, [usuario], async (err, row) => {
        if (err) return console.error(err.message);
        if (!row) return console.log("Usuario no encontrado.");

        // Comparamos la clave que puso ahora con el hash guardado
        const esValida = await bcrypt.compare(claveIntento, row.password);

        if (esValida) {
            console.log("¡Acceso correcto! Bienvenido.");
        } else {
            console.log("Contraseña incorrecta.");
        }
    });
}
const express = require('express');
const { registrar, login } = require('./script'); // Importamos tus funciones
const app = express();

// Para que el servidor entienda los datos que mandás desde el Front
app.use(express.json());

// RUTA DE REGISTRO
app.post('/registrar', async (req, res) => {
    const { usuario, clave } = req.body;
    
    try {
        await registrar(usuario, clave);
        res.status(201).send(`Usuario ${usuario} registrado con éxito.`);
    } catch (error) {
        res.status(500).send("Error en el servidor al registrar.");
    }
});

// RUTA DE LOGIN
app.post('/login', async (req, res) => {
    const { usuario, clave } = req.body;
    
    // Aquí llamamos a tu función de login que usa bcrypt.compare
    login(usuario, clave); 
    
    // Nota: Por ahora el login solo loguea en consola, 
    // después lo haremos para que responda al navegador.
    res.send("Procesando login... revisá la consola del servidor.");
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor de AdminApp corriendo en http://localhost:${PORT}`);
});
// Al final de Backend/script.js
module.exports = { registrar, login };