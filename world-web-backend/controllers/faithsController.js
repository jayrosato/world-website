
const { faiths } = require('../db/model')

async function getFaiths(req, res) {
    let faithsInfo = await faiths.getRecords()
    console.log(faithsInfo)
    res.json(faithsInfo)
}

module.exports = {getFaiths}