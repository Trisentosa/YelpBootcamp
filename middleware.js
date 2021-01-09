const { campgroundSchema } = require('./schemas'); //Joi schema
const { reviewSchema } = require('./schemas'); //Joi Schema

const ExpressError = require('./utilities/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');

//file size thing
const multer = require('multer');

const { storage } = require('./cloudinary');
const upload = multer({
    storage,
    limits: { fileSize: 2000000 }
    //filesize in bytes, in this case it's 500 kb 
});

module.exports.uploadFile = (req, res, next) => {
    const uploadProcess = upload.array('image');
    uploadProcess(req, res, err => {
        if (err instanceof multer.MulterError) {
            return next(new Error(err, 500));
        } else if (err) {
            return next(new Error(err, 500));
        }
        next();
    });
};

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You Must be Signed in!');
        return res.redirect('/login');
    }
    next();
}

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that')
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that')
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        // required for middleware to continue
        next();
    }
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        // required for middleware to continue
        next();
    }
}