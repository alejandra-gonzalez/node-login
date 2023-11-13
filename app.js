const bodyParser = require("body-parser");

// Bring in necessary packages
let express = require("express"),
  mongoose = require("mongoose"),
  passport = require("passport"),
  bodyParse = require("body-parser"),
  passportLocal = require("passport-local");
const { nextTick } = require("process");
const User = require("./model/User");
let app = express();
//Uncomment line below and add your own secret string
// let secretString = "";

app.use(express.static("public"));

//connection to MongoDB + Atlas
// Uncomment line below and add your database connection string
// const dbConStr = '';
mongoose.connect(dbConStr).then(() => {
  console.log("Connected to MongoDB");
}).catch((err) => {
  console.log(err);
})

app.set("view engine", "ejs");
app.use(bodyParse.urlencoded({extended: "true"}));
app.use(require("express-session")({
  secret: secretString,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new passportLocal(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Routes

app.get("/", function (req, res){
  res.render("home");
});

app.get("/secret", isLoggedIn, function(req, res) {
  res.render('secret'); 
});

app.get("/register", function(req, res){
  res.render("register");
});

app.post("/register", async(req, res) => {
  const user = await User.create({
    email: req.body.email,
    password: req.body.password
  });
  return res.status(200).json(user);
});

app.get("/login", function(req, res){
  res.render("login");
});

app.post("/login", async function(req, res){
  try {
    const user = await User.findOne({email: req.body.email})
    if (user) {
      const result = req.body.password === user.password;
      if (result){
        res.render("secret");
      } else {
        res.status(400).json({error: "password doesn't match"});
      }
    } else {
      res.status(400).json({error: "user doesn't exist"});
    }
  } catch (error) {
    res.status(400).json({error});
  }
});

app.get("/logout", function(req, res) {
  req.logout(function(err){
    if (err) {return nextTick(err);}
    res.redirect('/');
  });
});

app.get("/reset_pass", function(req,res) {
  res.render("reset_pass");
})

app.post("/reset", function(req, res){
  try {
    const user = User.findOne({email: req.body.email})
    if (user) {
      user.update({
        password: req.body.password
      }).then(() => {
        res.redirect("/login");
      });
    } else {
      res.status(400).json({error: "user doesn't exist"});
    }
  } catch (error) {
    res.status(400).json({error});
  }
});

function isLoggedIn(req, res, next){
  if (req.isAuthenticated()) return next;
  res.redirect("/login");
}

let port = process.env.PORT || 3000;
app.listen(port, function(){
  console.log("Server has started!");
});