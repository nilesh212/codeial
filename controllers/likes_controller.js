const Post = require("../models/post");
const Like = require("../models/like");
const Comment = require("../models/comment");

module.exports.toggleLike = async function (req, res) {
  try {
    // likes/toggle/?id=abcde&type=Post
    let likeable;
    let deleted = false;

    if (req.query.type == "Post") {
      likeable = await Post.findById(req.query.id).populate("likes");
    } else {
      likeable = await Comment.findById(req.query.id).populate("likes");
    }

    // check if a like already exists
    let existingLike = await Like.findOne({
      user: req.user.id,
      likeable: req.query.id,
      onModel: req.query.type,
    });

    // if a like already exists then delete it
    if (existingLike) {
      likeable.likes.pull(existingLike._id);
      likeable.save();
      existingLike.remove();
      deleted = true;
    } else {
      // else a make new like
      let newLike = await Like.create({
        user: req.user.id,
        likeable: req.query.id,
        onModel: req.query.type,
      });

      likeable.likes.push(newLike._id);
      likeable.save();
    }

    return res.status(200).json({
      data: {
        deleted: deleted,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Internal server Error",
    });
  }
};
