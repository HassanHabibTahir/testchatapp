import pkg from "mongoose";
const { Schema, model } = pkg;
const feedPreferences = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    HashTags: [
      {
        type: String,
      },
    ],
    accountType: [
      {
        type: String,
        enum: ["seller", "consultant", "supplier", "admin"],
      },
    ],
  },
  { timestamps: true }
);
export const FeedPreferences = model("FeedPreferences", feedPreferences);
