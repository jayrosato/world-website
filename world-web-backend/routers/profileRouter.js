const { Router } = require('express');
const profileController = require('../controllers/profileController')
const profileRouter = Router();

profileRouter.post('/profile/:id', profileController.profilePost);

module.exports = profileRouter;