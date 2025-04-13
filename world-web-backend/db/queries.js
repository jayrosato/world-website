const pool = require('./pool');

async function getFaiths() {
    const {rows} = await pool.query('SELECT * FROM faiths');
    return rows;
}

async function getFaith(id) {
    const {rows} = await pool.query('SELECT * FROM faiths WHERE id=$1', [id]);
    return rows;
}

module.exports = {getFaiths, getFaith}