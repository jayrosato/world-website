//add users to replies/post detail view in getPost
//return post id in create post? maybe
const { posts, likes } = require('../db/model')
const {body, validationResult } = require('express-validator');

async function getPosts(req, res) {
    let postsInfo = await posts.mergeTables('users', ['posts.id', 'title', 'text', 'author','parent_post', 'username'], 'author', 'id')
    res.json(postsInfo)
}

async function getPost(req, res) {
    const id = req.params.id
    let post = await posts.mergeFilterTable(['posts.id', 'title', 'text', 'author', 'parent_post', 'username'], 'users', 'author', 'id', {'posts.id':id, 'parent_post':id}, 'OR')
    let postIds = []
    post.forEach((p) => {postIds.push(p.id)})
    let postLikes = await likes.filterTable('post', postIds)
    res.json([post, postLikes])
}

const lengthErr = 'must be between 1 and 255 characters.';
const validatePost = [
    body('title').trim()
        .isLength({min:1, max:255}).withMessage(`Title ${lengthErr}`) 
];

const postCreatePost = [
    validatePost, async function(req, res) {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400)
        }
        const {author, title, text, parent_post} = req.body;
        await posts.createRecord({'author':author, 'title':title, 'text':text, 'parent_post':parent_post})
        return res.status(200).json({ message: "Reply posted successfully" });
    }
]

const postUpdatePost = [
    validatePost, async function(req, res) {
        const id = req.params.id
        console.log(id)
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            console.error(errors)
            return res.status(500).json({ error: "Failed to delete post." })
        }
        const {title, text} = req.body;
        await posts.updateRecord(id, {'title':title, 'text':text})
        return res.status(200).json({ message: "Reply updated successfully" });
    }
]

async function postDeletePost(req, res){
    const id = req.params.id
    try{
        await posts.deleteRecord(id)
        return res.status(200).json({ message: "Reply deleted successfully" });;
    }
    catch(err){
        return res.status(500).json({ error: "Failed to delete post." });
    }
}

async function likePost(req, res){
    const {liker, post} = req.body;
        await likes.createRecord({'liker':liker, 'post':post})
        return res.status(200).json({ message: "Reply posted successfully" });
}

async function unlikePost(req, res){
    console.log('a')
    const {liker, post} = req.body;
    try{
        await  likes.deleteWhere({'liker':liker, 'post':post})
        return res.status(200).json({ message: "Post Unliked" });;
    }
    catch(err){
        return res.status(500).json({ error: "Unlike failed." });
    }
}
module.exports = { getPosts, getPost, postCreatePost, postUpdatePost, postDeletePost, likePost, unlikePost }