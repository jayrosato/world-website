const dbPass = process.env.DBPASS

const { Pool } = require('pg');

module.exports = new Pool({
    host:'localhost',
    user:'postgres',
    database:'WorldProject',
    password: dbPass,
    port: 5432
});