import mongoose, { Schema } from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    _id: {
      type: Schema.Types.ObjectId,
      default: () => mongoose.Types.ObjectId().toString(),
    },
    author: { type: Schema.Types.ObjectId, ref: "User" },
    conversationId: {
      type: String,
    },
    senderId: {
      type: String,
    },
    senderName: {
      type: String,
      required: true,
    },
    receiverId: {
      type: String,
      required: true,
    },

    message: {
      text: {
        type: String,
        default: "",
      },
      file: { type: Array },
    },
    messageTime: {
      type: String,
    },
    unreadCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      default: "unseen",
    },
    deleteMessage: [
      {
        deleteByUser: {
          type: String,
          default: "",
        },
        deleteStatus: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  { timestamps: true }
);
export const messageModal = mongoose.model("messageModal", messageSchema);
