const User = require("../../../models/user");
const env = require("../../../config/environment");
const jwt = require("jsonwebtoken");

module.exports.createSession = async function (req, res) {
  try {
    let user = await User.findOne({ email: req.body.email });

    if (!user || req.body.password != user.password) {
      return res.status(422).json({
        message: "Invalid username or password",
      });
    }

    return res.status(200).json({
      message: "Sign in successful, here is your token, please keep it safe!",
      data: {
        token: jwt.sign(user.toJSON(), env.jwt_secret, { expiresIn: "100000" }),
      },
    });
  } catch (err) {
    console.log("********** ", err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
