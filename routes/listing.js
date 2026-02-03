const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner } = require("../middleware.js");
const listingController = require("../controllers/listing.js");

// Validate Listing Middleware
const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        const errMsg = error.details.map(el => el.message).join(",");
        throw new ExpressError(404, errMsg);
    } else {
        next();
    }
};



// Routes
router.route("/")
    .get(wrapAsync(listingController.index)) // Index route
    .post(validateListing, wrapAsync(listingController.create)); // Create route

// New Route
router.get("/new", isLoggedIn, listingController.new);

router.route("/:id")
    .get(wrapAsync(listingController.show)) // Show route
    .put(isLoggedIn, isOwner, validateListing, wrapAsync(listingController.update)) // Update route
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.delete)); // Delete route


// Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.edit));

module.exports = router;
