const { Router } = require('express');
const forumController = require('../controllers/forumController')
const forumRouter = Router()

forumRouter.get('/forum', forumController.getPosts)
forumRouter.get('/forum/:id', forumController.getPost)
forumRouter.post('/forum/create', forumController.postCreatePost)
forumRouter.post('/forum/:id/update', forumController.postUpdatePost)
forumRouter.post('/forum/:id/delete', forumController.postDeletePost)

module.exports = forumRouter