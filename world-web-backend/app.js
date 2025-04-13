const port = process.env.PORT

const path = require('node:path');
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const cors = require('cors');

const indexRouter = require('./routers/indexRouter')
const faithsRouter = require('./routers/faithsRouter')

const app = express();
app.use(cors())
app.use(express.urlencoded({extended: false}))

app.use('/', indexRouter)
app.all('.faiths', faithsRouter)
app.all('/faiths/:id', faithsRouter)

app.listen(port, () => {
    console.log(`server live on port ${port}`)
})