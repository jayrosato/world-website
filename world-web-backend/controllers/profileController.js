
const {body, validationResult } = require('express-validator');
const bcryptjs = require('bcryptjs')
const { users } = require('../db/model')

const lengthErr = 'must be between 1 and 255 characters.';
const emailErr = 'Double check that your email is correct.'

const validateUser =(id)=> [
    body('username').trim()
        .isLength({min:1, max:255}).withMessage(`Username ${lengthErr}`)
        .custom(async(value) => {
            const checkUser = await users.getRecords(value, 'username')
            //const checkUser = await db.getUsername(value);
            if (checkUser && checkUser.id != id) {
                throw new Error('Username already in use');
            }
              return true;
            }),

    body('email').trim()
        .isEmail().withMessage(`${emailErr}`)
        .isLength({min:1, max:255}).withMessage(`Email ${lengthErr}`)
        .custom(async(value) => {
            const checkEmail = await users.getRecords(value, 'email')
            //const checkEmail = await db.getEmail(value);
            if (checkEmail && checkEmail.id != id) {
                throw new Error('Email already in use');
              }
              return true;
            }),
        
];

const runValidationWithId = (req, res, next) => {
    const id = req.params.id;
    const validators = validateUser(id);

    Promise.all(validators.map(validation => validation.run(req)))
        .then(() => next())
        .catch(err => next(err));
};

const profilePost = [
    runValidationWithId, async function(req, res) {
        const id = req.params.id
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            console.log(errors)
            return res.status(500).json({errors:errors.array()})
        }
        //const hashedPass = await bcryptjs.hash(req.body.password, 10);
        const {username, email} = req.body;
        await users.updateRecord(id, {'username':username, 'email':email})
        //await db.updateUser(id, username, email)
        const user = await users.getRecords(username, 'username')
        req.login(user, (err) => {
            if (err) {
              return res.status(500).json({ error: "Login after signup failed" });
            }
          
            return res.status(200).json({ loggedIn: true, user: user });
          });
    }
]

async function deleteProfilePost(req, res){
    const id = req.params.id
    req.logout((err)=>{
        if(err){return next(err)}
        res.status(200).json({loggedIn: false})
    })
    try{
        await users.deleteRecord(id)
        return res.status(200).json({ loggedIn: false });
    }
    catch(err){
        return res.status(500).json({ error: "Failed to delete account." });
    }
}

module.exports = {profilePost, deleteProfilePost}