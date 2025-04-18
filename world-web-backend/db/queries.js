const pool = require('./pool');

async function  getUsername(username){
    const { rows } = await pool.query('SELECT id, username, password, email, access_level FROM users WHERE username = $1', [username])
    return rows[0];
}

async function  getEmail(email){
    const { rows } = await pool.query('SELECT id, username, password, email, access_level FROM users WHERE email = $1', [email])
    return rows[0];
}

async function createUser(username, password, email){
    const accessLevel = 'member';
    await pool.query('INSERT INTO users (username, password, email, access_level) VALUES ($1, $2, $3, $4)'
        , [username, password, email, accessLevel]);
}


async function getFaiths() {
    const {rows} = await pool.query('SELECT * FROM faiths');
    return rows;
}

async function getFaith(id) {
    const {rows} = await pool.query('SELECT * FROM faiths WHERE id=$1', [id]);
    return rows;
}

module.exports = {getUsername, getEmail, createUser, getFaiths, getFaith}