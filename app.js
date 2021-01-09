if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}
//Primary Needs
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');

//mongo sanitize
const mongoSanitize = require('express-mongo-sanitize');
app.use(mongoSanitize({
    replaceWith:'_'
}));

//Helmet
const helmet = require("helmet");
app.use(helmet());

const scriptSrcUrls = [
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://cdn.jsdelivr.net",
    "https://kit-free.fontawesome.com/",
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
                "https://res.cloudinary.com/dhc3gjs1e/",
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

//Error handling 
const Joi = require('joi');
const { campgroundSchema, reviewSchema } = require('./schemas');
const ExpressError = require('./utilities/ExpressError');
const catchAsync = require('./utilities/catchAsync');
const ObjectID = require('mongodb').ObjectID;

//Models
const Campground = require('./models/campground');
const Review = require('./models/review')
const User = require('./models/user');

//Routes
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');
//ejs-mate setup
const ejsMate = require('ejs-mate');
app.engine('ejs', ejsMate);

//Method-override stuff
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

//Static files
app.use(express.static(path.join(__dirname, 'public')));

//Mongoose connection
//'mongodb://localhost:27017/yelp-camp'
const dbUrl = process.env.DB_URL;
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})
const db = mongoose.connection;
db.on("error", console.error.bind(console, 'connection error'));
db.once("open", () => {
    console.log('Database connected');
})

//Session configuration
const secret = process.env.SECRET || 'thisisabadsecret'
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const store = new MongoStore({
    url:dbUrl,
    secret: secret,
    touchAfter : 24*60*60 //prevent uneccessary resave(seconds)
});
store.on("error",function (e) {
    console.log("Session Store Error!", e)    
})
const sessionConfig = {
    store:store,
    name: '__utmz', //some random ass name to confuse people
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //secure:true,
        expires: Date.now() + (1000 * 60 * 60 * 24 * 7),
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
}
app.use(session(sessionConfig));


//Passport configuration
const passport = require('passport');
const LocalStrategy = require('passport-local');
app.use(passport.initialize());
//For persistent login instead of login everytime
//Also, passport.session() have to be under where session is defined
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());       //Serialize User into session
passport.deserializeUser(User.deserializeUser());   //Deserialize User out of session

//Flash
const flash = require('connect-flash');
app.use(flash());
//middleware LOCALS
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

//Parsing 
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(express.json()) // for parsing application/json

//EJS
app.set('view engine', 'ejs')  //tell we're using ejs
app.set('views', path.join(__dirname, 'views'))//so we can access it outside this directory

/*****************************INITIALIZATION STUFF ENDS HERE******************************************************************************/
app.get('/', (req, res) => {
    res.render('home');
})

app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoutes);

// any other request that we dont need
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found!!!', 404));
})

//Error handler
app.use((err, req, res, next) => {
    const { status = 500 } = err;
    if (!err.message) { err.message = 'Oh no! Something went wrong' };
    res.status(status).render('error', { err });
})

const port = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Connected to port ${port}`)
})
