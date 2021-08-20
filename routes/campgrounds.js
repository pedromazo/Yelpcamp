const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware');

router.get('/',catchAsync(async (req,res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', {campgrounds})

}))

router.get('/new', isLoggedIn, (req,res) => {
    res.render('campgrounds/new');
})


router.get('/:id', catchAsync(async (req,res) => {
    try {
    const campground = await Campground.findById(req.params.id).populate({
        path:'reviews', //WE POPULATE THE REVIEWS
        populate: { //THEN
            path:'author' //WE POPULATE THE AUTHORS ON EACH OF THEM
        }
    }).populate('author'); //THEM WE POPULATE THE ON AUHOR OF THIS CAMPGROUND
    console.log(campground);
    // if(!campground){
        // req.flash('error','Cannot find that campground');
        // return res.redirect('/campgrounds');
    //}
    res.render('campgrounds/show', {campground})
    } catch{
        req.flash('error','Cannot find that campground');
        return res.redirect('/campgrounds');
    }    
}))

router.post('/',isLoggedIn, validateCampground, catchAsync(async (req,res, next) => {
    // if(!req.body.campground) throw new ExpressError('invalid campground data',400); //need this in case somebody uses postman to create a invalid campground
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Successfully created a new campground');
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.get('/:id/edit',isLoggedIn, isAuthor, catchAsync(async(req,res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id)
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', {campground});
}))

router.put('/:id',isLoggedIn, isAuthor, validateCampground, catchAsync(async (req,res) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground});
    req.flash('success', 'Successfully updated the campground');
    res.redirect(`/campgrounds/${campground._id}`);
}))

router.delete('/:id',isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground');
    res.redirect('/campgrounds');
}))

module.exports = router;