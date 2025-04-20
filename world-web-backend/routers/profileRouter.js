const { Router } = require('express');
const profileController = require('../controllers/profileController')
const profileRouter = Router();

profileRouter.post('/profile/:id', profileController.profilePost);
profileRouter.post('/profile/:id/delete', profileController.deleteProfilePost)
module.exports = profileRouter;