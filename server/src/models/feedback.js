import pkg from "mongoose";
const { Schema, model } = pkg;
const feedbackSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userId: { type: String },
    feedback: { type: String, required: true },
    feederId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    rating: { type: Number, default: 0, min: 1, max: 5 }, // Add rating field
  },
  { timestamps: true }
);
export const feedbackModal = model("feedback", feedbackSchema);
