db = require('../db/queries')

function loadFaiths(req, res) {
    res.json(db.getFaiths)
}

async function getFaith(req, res) {
    let faith = await db.getFaith(req.params.id);
    res.json(faith)
}

module.exports = {loadFaiths, getFaith}