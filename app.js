const express = require('express');
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate')
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressErrors')
const Joi = require('joi');
const {campgroundSchema} = require('./schemas.js');

const path = require('path');  //necessary so i can run the code from anywhere and it still will find the views folder

mongoose.connect('mongodb://localhost:27017/yelp-camp', {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true});




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

const validateCampground = (req, res, next) => { // JOI MIDDLEWARE
    const {error} = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }

}

app.get('/',(req,res) => {
    res.render('home')
})

app.get('/campgrounds',catchAsync(async (req,res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', {campgrounds})

}))

app.get('/campgrounds/new', (req,res) => {
    res.render('campgrounds/new');
})


app.get('/campgrounds/:id', catchAsync(async (req,res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/show', {campground})    
}))

app.post('/campgrounds',validateCampground, catchAsync(async (req,res, next) => {
    // if(!req.body.campground) throw new ExpressError('invalid campground data',400); //need this in case somebody uses postman to create a invalid campground
    const campground = new Campground(req.body.campground)
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.get('/campgrounds/:id/edit', catchAsync(async(req,res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', {campground});
}))

app.put('/campgrounds/:id',validateCampground, catchAsync(async (req,res) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground});
    res.redirect(`/campgrounds/${campground._id}`);
}))

app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const deleted = await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

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