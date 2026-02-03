const Listing = require("../models/listing");

module.exports.index = async (req,res)=>{
   const allListing = await Listing.find();
   res.render("listing/index.ejs" , {allListing});
}

module.exports.create = async (req,res,err)=>{//Create route
    
const newListing = new Listing(req.body.listing);
newListing.owner = req.user._id;
await newListing.save();
req.flash("success" , "New listing Created");
res.redirect("/listings")
};

module.exports.new = (req,res)=>{
    
    res.render("listing/new.ejs");
};

module.exports.show = async (req,res)=>{
    
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({path:"reviews" , populate:{
        path:"author",
    },}).populate("owner");
    if(!listing){
        req.flash("error" , "Listing does not exist");
        res.redirect("/listings");
    }
    res.render("listing/show.ejs" , {listing}); 
   
};

module.exports.edit = async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error" , "Listing does not exist");
        res.redirect("/listings");
    }
    res.render("listing/edit.ejs" , {listing} );
};

module.exports.update = async (req,res)=>{
    let {id} = req.params;
   await Listing.findByIdAndUpdate(id ,{...req.body.listing});
   req.flash("success" , "Listing Updated");
   res.redirect("/listings");
};

module.exports.delete = async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success" , "Listing Deleted");
    res.redirect("/listings");
};
