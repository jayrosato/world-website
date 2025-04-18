require('dotenv').config();
const port = process.env.PORT

const path = require('node:path');
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const cors = require('cors');

const indexRouter = require('./routers/indexRouter')
const loginRouter = require('./routers/loginRouter')
const joinRouter = require('./routers/joinRouter')
const profileRouter = require('./routers/profileRouter')
const faithsRouter = require('./routers/faithsRouter');
const { profile } = require('node:console');

const app = express();
app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true               
  }));
app.use(session({secret:'secret', resave:false, saveUninitialized: false,
    cookie: {
        sameSite: 'lax',
        secure: false
      }
}))
app.use(passport.session())
app.use(express.urlencoded({extended: false}))

app.use('/', indexRouter)
app.all('.faiths', faithsRouter)
app.all('/faiths/:id', faithsRouter)

app.use(express.json());
app.all('/login', loginRouter)
app.all('/session', loginRouter)
app.all('/join', joinRouter)
app.all('/profile/:id', profileRouter)

app.all('/logout', (req, res, next) => {
  req.logout((err)=>{
      if(err){return next(err)}
      res.status(200).json({loggedIn: false})
  })
})


app.listen(port, () => {
    console.log(`server live on port ${port}`)
})