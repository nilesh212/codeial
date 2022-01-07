const passport = require("passport");
const env = require("./environment");
const JWTStrategy = require("passport-jwt").Strategy;

// We are using ExtractJWT to get JWT from header
const ExtractJWT = require("passport-jwt").ExtractJwt;

const User = require("../models/user");

let opts = {
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: env.jwt_secret,
};

passport.use(
  new JWTStrategy(opts, function (jwtPayLoad, done) {
    User.findById(jwtPayLoad._id, function (err, user) {
      if (err) {
        console.log("Error in finding user from JWT", err);
      }

      //Here we are not checking the password because localStrategy has already checked the password
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    });
  })
);

module.exports = passport;
