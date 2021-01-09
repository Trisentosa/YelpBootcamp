const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utilities/catchAsync');
const ExpressError = require('../utilities/ExpressError');
const ObjectID = require('mongodb').ObjectID;
const { isLoggedIn, validateCampground, isAuthor, uploadFile } = require('../middleware');
const Campground = require('../models/campground');

const { storage } = require('../cloudinary/index');
//multer config
const multer = require('multer')
const upload = multer({ storage })

//ROUTES
router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, uploadFile, validateCampground, catchAsync(campgrounds.createCampground))

router.get('/new',isLoggedIn,campgrounds.renderNewForm)

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, uploadFile, validateCampground, catchAsync(campgrounds.editCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))

module.exports = router;

//>O<