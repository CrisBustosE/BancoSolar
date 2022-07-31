const { Pool } = require('pg');
const pool = new Pool({
    user: "postgres",
    host: "localhost",
    password: "datos",
    database: "bancosolar",
    port: 5432,
});

module.exports = { pool };