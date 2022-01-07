const User = require("../models/user");
// const passport = require("passport");
const fs = require("fs"); // fs=FileSystem
const path = require("path");

// profile is also called as action
//let's keep it same as before
module.exports.profile = function (req, res) {
  User.findById(req.params.id, function (err, user) {
    return res.render("user_profile", {
      title: "User",
      profile_user: user,
    });
  });
};

// Update users
module.exports.update = async function (req, res) {
  // if (req.user.id == req.params.id) {
  //   User.findByIdAndUpdate(req.params.id, req.body, function (err, user) {
  //     return res.redirect("back");
  //   });
  // } else {
  //   console.log("Unauthorized user");
  //   return res.status(401).send("Unauthorized");
  // }

  if (req.user.id == req.params.id) {
    try {
      let user = await User.findById(req.params.id);
      User.uploadedAvatar(req, res, function (err) {
        if (err) {
          console.log("*******Multer Error: ", err);
        }

        // Remember req.body will there in uploadedAvatar, You cannot access req.body outside of uploadedAvatar
        // Because form has enctype as multipart/form-data.
        user.name = req.body.name;
        user.email = req.body.email;

        if (req.file) {
          if (user.avatar) {
            // fs.existsSync is used so that if manually somebody deleted the file to check this
            if (fs.existsSync(path.join(__dirname, "..", user.avatar))) {
              fs.unlinkSync(path.join(__dirname, "..", user.avatar));
            }
          }
          // this is saving the path of the uploaded file into the avatar field in the user
          user.avatar = User.avatarPath + "/" + req.file.filename;
        }
        user.save();
        return res.redirect("back");
      });
    } catch (err) {
      req.flash("error", err);
      return res.redirect("back");
    }
  } else {
    req.flash("error", err);
    return res.status(401).send("Unauthorized");
  }
};

// post is also called as action
module.exports.post = function (req, res) {
  return res.end("<h1>Post Uploaded!</h1>");
};

// signUp is also called as action
// render the sign up page
module.exports.signUp = function (req, res) {
  if (req.isAuthenticated()) {
    return res.redirect("/users/profile");
  }
  return res.render("user_sign_up", {
    title: "Codeial | Sign UP",
  });
};

// signIn is also called as action
//render the sign in page
module.exports.signIn = function (req, res) {
  if (req.isAuthenticated()) {
    return res.redirect("/users/profile");
  }
  return res.render("user_sign_in", {
    title: "Codeial | Sing In",
  });
};

// get sign up data
module.exports.create = function (req, res) {
  if (req.body.password != req.body.confirm_password) {
    return res.redirect("back");
  }
  User.findOne({ email: req.body.email }, function (err, user) {
    if (err) {
      console.log("Error in finding user in signing up");
      return;
    }
    if (!user) {
      User.create(req.body, function (err, user) {
        if (err) {
          console.log("error in creating user while signing up");
          return;
        }
        return res.redirect("/users/sign-in");
      });
    } else {
      return res.redirect("back");
    }
  });
};

// get sign in data
module.exports.createSession = function (req, res) {
  req.flash("success", "Logged in Successfully");
  return res.redirect("/");
};

// Sign out / destroy session
module.exports.destroySession = function (req, res) {
  req.logout();
  req.flash("success", "You have been Logged out!");
  return res.redirect("/");
};
