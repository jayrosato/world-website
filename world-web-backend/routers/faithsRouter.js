const { Router } = require('express');
const faithsController = require('../controllers/faithsController')
const faithsRouter = Router()

faithsRouter.get('/faiths/:id', faithsController.getFaith)

module.exports = faithsRouter