const Comment = require("../models/comment");
const Post = require("../models/post");
const commentMailer = require("../mailers/comments_mailer");
const queue = require("../config/kue");
const commentEmailWorker = require("../worker/comment_email_worker");
const Like = require("../models/like");

module.exports.create = async function (req, res) {
  try {
    let post = await Post.findById(req.body.post);
    if (post) {
      let comment = await Comment.create(
        {
          content: req.body.content,
          post: req.body.post,
          user: req.user._id,
        }
        // handle error
      );

      post.comments.push(comment);
      post.save();

      comment = await comment.populate("user", "name email");
      // commentMailer.newComment(comment);
      // as soon as create() is executed it saves data in job, that is why we are able to use
      // console.log("job enqueued!",job.id);
      let job = queue.create("emails", comment).save(function (err) {
        if (err) {
          console.log("Error in sending to the queue", err);
          return;
        }
        console.log("Job enqueued!", job.id);
      });
      if (req.xhr) {
        // Similar for comments to fetch the user's id!

        return res.status(200).json({
          data: {
            comment: comment,
          },
          message: "Post created!",
        });
      }
      req.flash("success", "Comment published!");
      res.redirect("/");
    }
  } catch (err) {
    console.log("Error", err);
    return;
  }
};

module.exports.destroy = async function (req, res) {
  try {
    let comment = await Comment.findById(req.params.id);

    if (comment.user == req.user.id) {
      let postId = comment.post;
      comment.remove();
      let post = await Post.findByIdAndUpdate(postId, {
        $pull: { comments: req.params.id },
      });

      // CHANGE:: destroy the associated likes for this comment
      await Like.deleteMany({ likeable: comment._id, onModel: "Comment" });

      // send the comment id which was deleted back to the views
      if (req.xhr) {
        return res.status(200).json({
          data: {
            comment_id: req.params.id,
          },
          message: "Post Deleted!",
        });
      }
      req.flash("success", "Comment deleted!");
      return res.redirect("back");
    } else {
      //Remember else part is very important.
      return res.redirect("back");
    }
  } catch (err) {
    console.log("Error", err);
    return;
  }
};
