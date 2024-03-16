import { Schema, model, Mongoose } from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
const { BCRYPT_PASSWORD } = process.env;
const userSchema = new Schema(
  {
    firstName: String,
    lastName: String,
    accountType: {
      type: String,
      enum: ["seller", "consultant", "supplier", "admin"],
    },

    city: String,
    country: String,
    businessName: Array,
    ecommercePlatform: Array,
    businessWebsites: Array,
    profilePic: String,
    businessCategory: Array,
    productCategory: Array,
    description: String,
    phoneNo: String,
    website: Array,
    interestingCategories: Array,
    facebookLink: String,
    linkedinLink: String,
    upworkLink: String,
    otherProfessionalLinks: [],
    toolsUsed: [],
    affiliatedAgency: [],
    email: {
      type: String,
      required: [true, "Please Enter Your Email!"],
      unique: true,
      validate: [validator.isEmail, "Please Enter a valid Email!"],
    },
    password: {
      type: String,
      minLength: [8, "Minimum 8 characters are required for password!"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isUserBlocked: {
      type: Boolean,
      default: false,
    },
    deviceToken: { type: String },
    otpverification: { otp: String, expiry: Date },
    emailChangeOTP: { newEmail: String, otp: String, expiry: Date },
    bookmarks: [{ type: Schema.Types.ObjectId, ref: "Post" }],
    isConnectedUsers: [
      {
        connectByID: {
          type: String,
        },
        connectStatus: {
          type: Boolean,
          default: false,
        },
        connectToID: {
          type: String,
        },
      },
    ],
    chatMessages: [
      {
        senderId: {
          type: String,
        },
        receiverId: {
          type: String,
        },
        messageIds: [
          {
            type: Schema.Types.ObjectId,
            ref: "messageModel",
          },
        ],
      },
    ],
    callHistory: [
      {
        callSenderId: {
          type: String,
        },
        callReceiverId: {
          type: String,
        },
        callIds: [
          {
            type: Schema.Types.ObjectId,
            ref: "Calls",
          },
        ],
      },
    ],
    sharedPosts: [{ type: Schema.Types.ObjectId, ref: "SharedPost" }],
    ratingStart: [],
    ratingStartValue: {
      type: Number,
      default: 0,
    },
    request_to_identify_docs: {
      type: Boolean,
      default: false,
    },
    docs_for_identify: {
      type: String,
    },
    identified_docs_status: {
      type: Boolean,
      default: false,
    },
    blockedUsers: [
      {
        blockedByID: {
          type: String,
        },
        blockedStatus: {
          type: Boolean,
          default: false,
        },
        blockedToID: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);
userSchema.pre("save", function () {
  if (this.isModified("password")) {
    this.password = bcrypt.hashSync(this.password, Number(BCRYPT_PASSWORD));
  }
});

userSchema.methods.matchesPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};
export const User = model("User", userSchema);
