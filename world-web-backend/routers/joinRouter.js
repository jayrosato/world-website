const { Router } = require('express');
const joinController = require('../controllers/joinController')
const joinRouter = Router();

joinRouter.post('/join', joinController.joinPost);

module.exports = joinRouter;