const Post = require("../models/post");
const User = require("../models/user");

module.exports.home = async function (request, response) {
  try {
    // CHANGE:: populate the likes of each post and comment
    let posts = await Post.find({})
      .sort("-createdAt")
      .populate("user")
      .populate({
        path: "comments",
        populate: {
          path: "user",
        },
        populate: {
          path: "likes",
        },
      })
      .populate("likes");

    let users = await User.find({});

    return response.render("home", {
      title: "Home",
      posts: posts,
      all_users: users,
    });
  } catch (err) {
    console.log("Error", err);
    return;
  }
};

// module.exports.actionName = function(req,res){}
