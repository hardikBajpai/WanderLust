const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema,reviewSchema} = require("./schema.js");
const Review = require("./models/review.js");
const session  = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const User = require("./models/users.js");
const LocalStrategy = require("passport-local");



const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

app.engine("ejs" , ejsMate);
app.set("view engine","ejs");
app.set("views" , path.join(__dirname , "views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname , "/public")));

const sessionOptions = {
   secret:"mysupersecretcode",
   resave:false,
   saveUninitialized:true,
   cookie : {
       expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
       maxAge:7 * 24 * 60 * 60 * 1000,
       httpOnly: true
   }
};

app.use(session(sessionOptions));
app.use(flash());



app.use(passport.initialize());
app.use(passport.session())

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

main().then(()=>{
    console.log("Connected to DB");
}).catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

app.get("/",(req,res)=>{
    res.send("Root is Listening");
})

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})

// app.get("/demoUser" , async(req,res)=>{
// let fakeUser = new User({
//     email:"student@gmail.com",
//     username:"delta-student"
// });

// let registeredUser = await User.register(fakeUser , "helloworld");
// res.send(registeredUser);
// })

app.use("/listings" , listingRouter);

app.use("/listings/:id/reviews" , reviewRouter);

app.use("/" , userRouter);

app.all(/.*/ , (req,res,next)=>{
next(new ExpressError(404 , "Page not Found!"));
})



app.use((err,req,res,next)=>{
    let {statusCode = 500, message = "Something went wrong"} = err;
    res.status(statusCode).render("listing/error.ejs" , {err});
})

app.listen(8080,()=>{
    console.log("Server is Listening to port 8080");
})