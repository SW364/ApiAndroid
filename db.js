const { Pool } = require('pg');

// Configuración de la conexión a PostgreSQL (usando la URL externa)
const pool = new Pool({
    user: 'androidstudio_user',
    host: 'dpg-cs3d613tq21c73egj8l0-a.oregon-postgres.render.com', // Hostname externo
    database: 'androidstudio',
    password: 'T7zS0SUlmC6JHH1ZpXmyImIFOUTPgFnp',
    port: 5432, // Puerto por defecto de PostgreSQL
    ssl: {
        rejectUnauthorized: false // Necesario para conexiones seguras (SSL)
    }
});

// Probar la conexión
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error conectando a la base de datos:', err.stack);
    }
    console.log('Conexión a PostgreSQL exitosa');
    release(); // Cerrar la conexión
});

const query = (text, params) => pool.query(text, params);

module.exports = {
    query,
};