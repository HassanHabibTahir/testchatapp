import { Schema, model, mongoose } from "mongoose";

const boostPost = new Schema({
  post: { type: Schema.Types.ObjectId, ref: "Post" },
  user: { type: Schema.Types.ObjectId, ref: "User" },
  duration: {
    type: String,
    required: true,
  },
  futureTime: {
    type: Number,
    default: 0,
  },
  costPay: { type: String },
  targetAudience: [{ type: String }],
  impression: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      date: { type: Date, default: Date.now },
    },
  ],
  statusBoost: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  durationTime: {
    type: Date,
    default: Date.now,
  },
  targetCountry: {
    type: String,
  },
});

export const BoostPost = model("BoostPost", boostPost);
