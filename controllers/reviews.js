const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

//Post Review Callback
module.exports.createReview = async(req,res)=>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview); //pushing the newReview in reviews array
    await newReview.save();
    await listing.save();
    req.flash("success","New review is created!");
   res.redirect(`/listings/${listing._id}`);

};

//Delete Review Callback
module.exports.destroyReview = async(req,res,next)=>{
    let {id,reviewId} = req.params;
    await Review.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","Review is deleted!");
    res.redirect(`/listings/${id}`);
};