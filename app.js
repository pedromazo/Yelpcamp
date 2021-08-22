if (process.env.NODE_ENV !== "production") { //we are running in development environment
    require('dotenv').config();
}


const express = require('express');
const path = require('path');  //necessary so i can run the code from anywhere and it still will find the views folder
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate')
const ExpressError = require('./utils/ExpressErrors')
const session = require('express-session')
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const userRoutes = require('./routes/users')
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const MongoDBStore = require("connect-mongo")(session);
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
// const dbUrl = 'mongodb://localhost:27017/yelp-camp';


mongoose.connect(dbUrl, {
    useNewUrlParser: true,
     useCreateIndex: true,
      useUnifiedTopology: true,
       useFindAndModify: false
    });

const db = mongoose.connection; // just we dont have to reference mongoose.connection everytime, we symple write db
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate) 
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({extended:true})) //need to tell the express to parse the data
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize()); //special characters are not allowed in query strings
app.use(helmet());

const secret = process.env.SECRET || 'secretword';

const store = new MongoDBStore({
    url: dbUrl,
    secret,
    touchAfter: 24*60*60
});

store.on("error", function(e){
    console.log("Session store error", e)
});
const sessionConfig = {
    store, //or store:store
    name:'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }
};
app.use(session(sessionConfig));
app.use(flash());


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
//This is the array that needs added to
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
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
                "https://res.cloudinary.com/doafgkczh/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize()); //check docs
app.use(passport.session()); //we need for persistent login sessions, check docs, is needed after session()
passport.use(new LocalStrategy(User.authenticate())); //"hello passport, i would like you to use the local strategy required and the auth method is gonna be located on the User model and its called authenticate (docs passport-local-mongoose)"

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next) => {
    // console.log(req.query)
    res.locals.currentUser = req.user; //currentUser now is available everywhere, like the navbar
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

// app.get('/fakeUser', async (req,res) => {
//     const user = new User({email: 'pedro@mail.com', username: 'pedro'});
//     const newUser = await User.register(user, 'macaco');
//     res.send(newUser);
// })

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);


app.get('/',(req,res) => {
    res.render('home')
})


app.all('*',(req,res,next) => {
    next(new ExpressError('Page not found', 404))
})

app.use((err,req,res,next) => { //middleware for hangling errors
    const {statusCode = 500} = err;
    if(!err.message) err.message = 'something went wrong';
    res.status(statusCode).render('error', { err });

})
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}!`);
})