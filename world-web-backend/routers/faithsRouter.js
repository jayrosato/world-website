const { Router } = require('express');
const faithsController = require('../controllers/faithsController')
const faithsRouter = Router()

faithsRouter.get('/faiths', faithsController.getFaiths)

module.exports = faithsRouter