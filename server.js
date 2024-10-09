const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db'); // Importar la conexión de PostgreSQL desde db.js
const app = express();

app.use(express.json()); // Middleware para manejar solicitudes JSON

const SECRET_KEY = 'your-secret-key'; // Clave secreta para JWT

// Probar la conexión a la base de datos
db.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err.stack);
    } else {
        console.log('Conexión a PostgreSQL exitosa:', res.rows[0]);
    }
});

// Ruta para registrar un nuevo usuario
app.post('/register', async (req, res) => {
    const { name, surname, email, pwd, address, neighborhood, city, state, cp } = req.body;
    console.log("Datos recibidos:", req.body);

    try {
        // Encriptar la contraseña antes de guardarla
       // Encriptar la contraseña antes de guardarla
       const saltRounds = 10;
       const hashedPassword = await bcrypt.hash(pwd, saltRounds); // Fijate que `pwd` está presente y el `saltRounds` es correcto

        // Insertar el nuevo usuario en la base de datos
        const result = await db.query(
            `INSERT INTO users (name, surname, email, password, address, neighborhood, city, state, cp) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
            [name, surname, email, hashedPassword, address, neighborhood, city, state, cp]
        );

        const userId = result.rows[0].id;

        // Generar un token JWT
        const token = jwt.sign({ id: userId, email }, SECRET_KEY, { expiresIn: '1h' });

        res.status(201).json({ message: 'Usuario registrado con éxito', token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al registrar usuario' });
    }
});

// Ruta de login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Verificar si el usuario existe en la base de datos
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Credenciales incorrectas' });
        }

        const user = result.rows[0];

        // Verificar la contraseña
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Credenciales incorrectas' });
        }

        // Generar un token JWT
        const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });

        res.json({ message: 'Login exitoso', token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al iniciar sesión' });
    }
});

// Ruta para obtener todos los usuarios (solo para prueba)
app.get('/users', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM users');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al obtener usuarios' });
    }
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
