const passport = require("passport");

const LocalStrategy = require("passport-local").Strategy;

const User = require("../models/user");

// passport have to use localStrategy
// authentication using passport
// Here passport is using localstrategy to check who is signed in.
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passReqToCallback: true,
    },
    function (req, email, password, done) {
      // 1.whenever the passport is called email and password are automatically
      // passed on to function
      //2.done is a callback function, reporting back to passport.js
      //3. find a user and establish the identity
      User.findOne({ email: email }, function (err, user) {
        if (err) {
          req.flash("error", err);
          return done(err);
        }

        if (!user || user.password != password) {
          req.flash("error", "Invalid Username/Password");
          return done(null, false); //Authentication not done
        }

        // if user is found pass on the user
        return done(null, user);
      });
    }
  )
);

// serializing the user to decide which key is to be kept in the cookies
passport.serializeUser(function (user, done) {
  // this gets the user.id and encrypt the user.id
  done(null, user.id);
});

// deserializing the user from the key which is in the cookies;
passport.deserializeUser(function (id, done) {
  // Here we decrypt the id and find the user.
  User.findById(id, function (err, user) {
    if (err) {
      console.log("Error in finding user --> Passport");
      return done(err);
    }

    return done(null, user);
  });
});

//check if user is authenticated
// This is a middleware, since it has req,res and next
passport.checkAuthentication = function (req, res, next) {
  //if the user is signed in, then pass on the request to the next function(controller's action)
  // console.log("problem in checkAuthentication");
  if (req.isAuthenticated()) {
    return next();
  }

  //if the user is not signed in
  return res.redirect("/users/sign-in");
};

passport.setAuthenticatedUser = function (req, res, next) {
  if (req.isAuthenticated()) {
    // req.user contains current signed in user from the session cookie
    //  and we are just sending this to the locals for the views
    res.locals.user = req.user;
    //req.user is coming from the localStrategy.
  }
  next();
};

module.exports = passport;
