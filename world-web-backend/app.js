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
const faithsRouter = require('./routers/faithsRouter')

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
app.all('/join', joinRouter)


app.listen(port, () => {
    console.log(`server live on port ${port}`)
})