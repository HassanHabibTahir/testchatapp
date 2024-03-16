import pkg from "mongoose";
const { Schema, model } = pkg;

const callUsers = new Schema({
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  callSenderId: { type: String },
  callReceiverId: { type: Schema.Types.ObjectId, ref: "User" },
  isAccept: { type: Boolean, default: false },
  callTime: { type: String, required: true },
  durations: { type: String, required: true },
  // isVideoCall: { type: Boolean, default: false },
});
export const callModal = model("Calls", callUsers);
