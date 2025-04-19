
const { faiths } = require('../db/model')

async function getFaith(req, res) {
    let faith = await faiths.getRecords(req.params.id, 'id')
    // let faith = await db.getFaith(req.params.id);
    res.json(faith)
    console.log(faith)
}

module.exports = {getFaith}