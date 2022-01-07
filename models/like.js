const mongoose = require("mongoose");
const { t } = require("tar");

const likeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
    },
    // this defines the object id of the linked object
    likeable: {
      type: mongoose.Schema.ObjectId,
      require: true,
      refPath: "onModel",
    },
    //this field is used for defining the type of the liked object since this is dynamic refernce
    onModel: {
      type: String,
      required: true,
      enum: ["Post", "Comment"],
    },
  },
  {
    timestamps: true,
  }
);

const Like = mongoose.model("Like", likeSchema);

module.exports = Like;
