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
const passport = require('passport'); // fot authentication
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet');

const mongoSanitize = require('express-mongo-sanitize'); // used to prevent sql injection

const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

const MongoDBStore = require("connect-mongo");

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
// const dbUrl = 'mongodb://localhost:27017/yelp-camp';


mongoose.connect(dbUrl, {
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

app.use(mongoSanitize({
    replaceWith: '_' // replace a '$' sign with '_'
}));


const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

// default session store is memory store
// use mongo-connect for session store now
const store = MongoDBStore.create({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60 // prevent unnecessary session update; it will update session after a period of time.
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})


const sessionConfig = {
    store,
    name: 'yel-camp-session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, // dont let browser javascript access cookie
        // secure: true, // only allow to access cookie (e.g., user login) when we have https
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};




app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

// define "Content Security Policy" in helmet
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dsl1muf0t/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);



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
    // console.log(req.query);
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

