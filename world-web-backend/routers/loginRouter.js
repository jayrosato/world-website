const { Router } = require('express');
//const loginController = require('../controllers/logInController')
const loginRouter = Router()

const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;
const bcryptjs = require('bcryptjs')

const pool = require('../db/pool');

passport.use(
    new LocalStrategy(async (username, password, done) => {
        try{
            console.log(username)
            const { rows } = await pool.query("SELECT id, email, password FROM users WHERE email = $1", [username]);
            const user = rows[0]

            if(!user) {
                return done(null, false, { message: 'Incorrect email!'})
            }
            const match = await bcryptjs.compare(password, user.password);
            if(!match){
                return done(null, false, { message: "Incorrect password" })
            }
            console.log('success')
            return done(null, user);
        }
        catch(err){
            return done(err);
        }
    })
)

passport.serializeUser((user, done)=>{
    done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
    try{
        const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
        const user = rows[0];
        done(null, user)
    }
    catch(err){
        done(err)
    }
}
)

loginRouter.post('/login',
    passport.authenticate('local', {
      successRedirect: '/',
      failureRedirect: '/log-in'
    })
  );

module.exports = loginRouter;