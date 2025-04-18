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
            const { rows } = await pool.query("SELECT id, email, username, password, access_level FROM users WHERE email = $1", [username]);
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

loginRouter.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (!user) {
            return res.status(401).json({ message: info?.message || 'Login failed' });
          }
        if (err) {
            return res.status(500).json({ message: 'Server error', error: err });
        }
  
        req.logIn(user, (err) => {
            if (err) {
            return res.status(500).json({ message: 'Login error', error: err });
            }
  
        return res.status(200).json({ message: 'Login successful', user: { id: user.id, email: user.email, username: user.username } });
      });
    })(req, res, next);
  });

  loginRouter.get('/session', (req, res) => {
    if(req.isAuthenticated()){
        res.status(200).json({loggedIn: true, user: req.user})
    }
    else{res.status(401).json({loggedIn: false})}
  })
  
module.exports = loginRouter;