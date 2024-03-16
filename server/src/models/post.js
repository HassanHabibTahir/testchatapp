import { Schema, model } from "mongoose";
import { Comment } from "./index.js";

const postSchema = new Schema(
  {
    privacyStatus: {
      type: String,
      default: "public",
      enum: ["public", "private"],
    },
    text: { type: String },
    caption: { type: String },

    sharedPrivacy: {
      type: String,
      default: "public",
      enum: ["public", "private"],
    },
    file: { type: Array },
    fileType: {
      type: String,
      enum: ["video", "image", "pdf", "text", "media"],
    },
    label: { type: String },
    country: { type: String, required: true },
    // audienceCountry: { type: String },
    audiencePlateform: { type: String },
    duration: { type: String },
    totalCost: { type: String },
    cardName: { type: String },
    cardNumber: { type: String },
    cardExpiry: { type: String },
    cardCVV: { type: String },
    accountType: { type: String },
    sharedPosts: [{ type: Schema.Types.ObjectId, ref: "SharedPost" }],
    sharedTime: { type: Date },
    myShared: [{ type: Schema.Types.ObjectId }],
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    originalAuthor: { type: Schema.Types.ObjectId, ref: "User" },
    hashtags: [
      {
        type: String,
        required: true,
      },
    ],
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    boostPost: {
      boostId: {
        type: Schema.Types.ObjectId,
        ref: "BoostPost",
      },
      statusBoost: {
        type: Boolean,
        default: false,
      },
      originalPost: {
        type: Boolean,
        default: false,
      },
      impression: [
        {
          userId: { type: Schema.Types.ObjectId, ref: "User" },
          date: { type: Date, default: Date.now },
        },
      ],
    },
    bookmarks: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);
postSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    const comments = this.comments;
    for (let i = 0; i < comments.length; i++) {
      const parent = await Comment.findOne({ _id: comments[i] });
      await Comment.deleteMany({ _id: { $in: parent.replyComments } });
    }
    await Comment.deleteMany({ _id: { $in: comments } });
    next();
  }
);
export const Post = model("Post", postSchema);
