db = require('../db/testObjs')

function loadFaiths(req, res) {
    res.json(db.faiths)
}

module.exports = {loadFaiths}