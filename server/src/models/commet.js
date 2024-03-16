import pkg from "mongoose";

import { Post } from "./index.js";

const { Schema, model } = pkg;

const commentSchema = new Schema(
  {
    _id: {
      type: Schema.Types.ObjectId,
      default: () => mongoose.Types.ObjectId().toString(),
    },
    text: String,
    author: { type: Schema.Types.ObjectId, ref: "User" },
    replyComments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    likes: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

commentSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    const delComment = this._id;
    await Post.findOneAndUpdate(
      { comments: { $in: delComment._id } },
      { $pull: { comments: delComment._id } }
    );

    next();
  }
);

export const Comment = model("Comment", commentSchema);
