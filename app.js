const path = require('path');
const express = require('express');
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const morgan = require('morgan')
const exphbs = require('express-handlebars')
const methodOverride = require('method-override')
const passport = require('passport')
const session = require('express-session')
const MongoDbStore = require('connect-mongo');
const connectDB = require('./config/db');

// load config
dotenv.config({path: './config/config.env'})

// Passport config
require('./config/passport')(passport)
connectDB()
const app = express()

// Body parser
app.use(express.urlencoded({extended:false}))
app.use(express.json())

// Logging
if (process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}
// handlebars Helpers
const {
    formatDate,
    stripTags,
    truncate,
    editIcon,
    select,
} = require('./helpers/hbs')

// Handlebars
// Register view engin using Express handlebars
app.engine('.hbs', exphbs({helpers: {
    formatDate,
        stripTags,
        truncate,
        editIcon,
        select,
    },defaultLayout: 'main', extname: '.hbs'}));
app.set('view engine', '.hbs');

//Sessions
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: MongoDbStore.create({
        mongoUrl: process.env.MONGO_URI
    })
}))


//Passport Middleware
app.use(passport.initialize())
app.use(passport.session())

// Set global var
app.use(function (req, res, next) {
    res.locals.user = req.user || null
    next()
})

// Static folder
app.use(express.static(path.join(__dirname, 'public')))

// Routes
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/stories', require('./routes/stories'))

// connecting and listening to Port
const PORT = process.env.PORT || 3000
app.listen(PORT,
    console.log(`server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
)
