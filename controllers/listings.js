const Listing = require("../models/listing.js");
const { listingSchema } = require("../schema.js"); 
const ExpressError = require("../utils/ExpressError.js");
// Index route callback
module.exports.index = async (req, res, next) => {
    let allListings = await Listing.find({});
    res.render("index.ejs", { allListings });
};

// New route callback
module.exports.renderNewForm = (req, res) => {
    res.render("new.ejs");
};

// Show route callback
module.exports.showListing = async (req, res, next) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } }) 
    .populate("owner");
    if (!listing) {
        req.flash("error", "Listing you requested doesn't exist!");
        return res.redirect("/listings");
    }
    console.log(listing);
    res.render("show.ejs", { listing });
};

// Create route callback
module.exports.createListing = async (req, res, next) => {
    const result = listingSchema.validate(req.body);
    if (result.error) {
        throw new ExpressError(400, result.error.message);
    }

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    // If an image is uploaded, save it, otherwise don't set the image field
    if (req.file) {
        newListing.image = { url: req.file.path, filename: req.file.filename };
    }
    await newListing.save();
    req.flash("success", "New listing is created!");
    res.redirect("/listings");
};


// Edit route callback
module.exports.renderEditForm = async (req, res, next) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested doesn't exist!");
        return res.redirect("/listings");
    }
    res.render("edit.ejs", { listing });
};

// Update route callback
module.exports.updateListing = async (req, res, next) => {
    let { id } = req.params;
    const updatedListing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });

    if (!updatedListing) {
        req.flash("error", "Listing you requested doesn't exist!");
        return res.redirect("/listings");
    }

    req.flash("success", "Listing is updated!");
    res.redirect(`/listings/${id}`);
};

// Delete route callback
module.exports.destroyListing = async (req, res, next) => {
    let { id } = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);

    if (!deletedListing) {
        req.flash("error", "Listing you requested doesn't exist!");
        return res.redirect("/listings");
    }

    req.flash("success", "Listing is deleted!");
    res.redirect("/listings");
};