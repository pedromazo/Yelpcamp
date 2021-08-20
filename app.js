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

const userRoutes = require('./routes/users')
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');


mongoose.connect('mongodb://localhost:27017/yelp-camp', {
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



const sessionConfig = {
    secret: 'secretword',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }
};
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize()); //check docs
app.use(passport.session()); //we need for persistent login sessions, check docs, is needed after session()
passport.use(new LocalStrategy(User.authenticate())); //"hello passport, i would like you to use the local strategy required and the auth method is gonna be located on the User model and its called authenticate (docs passport-local-mongoose)"

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next) => {
    res.locals.currentUser = req.user; //currentUser now is available everywhere, like the navbar
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.get('/fakeUser', async (req,res) => {
    const user = new User({email: 'pedro@mail.com', username: 'pedro'});
    const newUser = await User.register(user, 'macaco');
    res.send(newUser);
})

app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoutes);

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

app.listen(3000, () => {
    console.log("Serving on port 3000!")
})