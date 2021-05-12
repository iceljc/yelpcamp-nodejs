if (process.env.NODE_ENV !== "production") {
    // access .env info when it is not in production mode
    require('dotenv').config();
}

// console.log(process.env.SECRET);

const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

// settings
app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
// import static files under the 'public' folder
app.use(express.static(path.join(__dirname, 'public'))); 

const sessionConfig = {
    secret: "thisshouldbeabettersecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, // dont let browser javascript access cookie
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};

app.use(session(sessionConfig));
app.use(flash());

// set passport middlewares
app.use(passport.initialize());
app.use(passport.session());
// configure passport
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// flash middleware
app.use((req, res, next) => {
    // console.log(req.session);
    // console.log(req.user);
    res.locals.currentUser = req.user; // get current user info
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});


/* 
    rest api
*/

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

// home page
app.get('/', (req, res) => {
    res.render('home');
});



// 404 error
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});


// error handler
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) {
        err.message = 'Oh No, Something Went Wrong!';
    }
    res.status(statusCode).render('error', { err });
});


// start server
app.listen(3000, () => {
    console.log("Server on port 3000");
})