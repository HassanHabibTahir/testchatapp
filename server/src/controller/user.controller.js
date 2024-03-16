//update user Profile
import {
  CustomError,
  sendMailForapproveIdentity,
} from "../middleware/index.js";
import { messageModal } from "../models/messages.js";
import { Post } from "../models/post.js";
import { User } from "../models/user.js";
import { uploadFile } from "../utils/index.js";
import { fileTypeFromBuffer } from "file-type";
import pkg from "agora-token";
const { RtcTokenBuilder, RtmTokenBuilder, RtcRole } = pkg;
const { APP_ID, APP_CERTIFICATE } = process.env;

// Update Users Profile
export const updateProfile = async (req, res) => {
  if (!req.body) {
    throw new CustomError("Please provide data to update!", 400);
  }
  const file = req.body.file;
  let objForUpdate = {};
  if (file) {
    let base64Image = file.split(";base64,").pop();
    const buffer = Buffer.from(base64Image, "base64");
    const mimeInfo = await fileTypeFromBuffer(buffer);
    let typeExtension = mimeInfo.ext;
    const fileKey = await uploadFile(buffer, typeExtension);
    req.body.profilePic = fileKey;
    if (fileKey) objForUpdate.profilePic = fileKey;
  }
  if (req.body.firstName) objForUpdate.firstName = req.body.firstName;
  if (req.body.lastName) objForUpdate.lastName = req.body.lastName;
  if (req.body.businessName) objForUpdate.businessName = req.body.businessName;
  if (req.body.city) objForUpdate.city = req.body.city;
  if (req.body.country) objForUpdate.country = req.body.country;
  if (req.body.businessWebsites)
    objForUpdate.businessWebsites = req.body.businessWebsites;
  if (req.body.ecommercePlatform)
    objForUpdate.ecommercePlatform = req.body.ecommercePlatform;
  if (req.body.businessCategory)
    objForUpdate.businessCategory = req.body.businessCategory;
  if (req.body.productCategory)
    objForUpdate.productCategory = req.body.productCategory;
  if (req.body.description) objForUpdate.description = req.body.description;
  if (req.body.phoneNo) objForUpdate.phoneNo = req.body.phoneNo;
  if (req.body.website) objForUpdate.website = req.body.website;
  if (req.body.interestingCategories)
    objForUpdate.interestingCategories = req.body.interestingCategories;
  if (req.body.facebookLink) objForUpdate.facebookLink = req.body.facebookLink;
  if (req.body.linkedinLink) objForUpdate.linkedinLink = req.body.linkedinLink;
  if (req.body.otherProfessionalLinks)
    objForUpdate.otherProfessionalLinks = req.body.otherProfessionalLinks;
  if (req.body.upworkLink) objForUpdate.upworkLink = req.body.upworkLink;
  if (req.body.toolsUsed) objForUpdate.toolsUsed = req.body.toolsUsed;
  if (req.body.affiliatedAgency)
    objForUpdate.affiliatedAgency = req.body.affiliatedAgency;
  const user = await User.findByIdAndUpdate(req.user._id, objForUpdate, {
    new: true,
  }).select(["-otpverification", "-password"]);
  res.status(200).json({
    success: true,
    message: "User updated successfully",
    user,
  });
};

// user Data
export const UserData = async (req, res) => {
  const { userId } = req.params;
  const user = await User.findOne({ _id: userId }).select([
    "-password",
    "-bookmarks",
    "-otpverification",
  ]);

  if (!user) {
    throw new CustomError("User Not Found", 404);
  }
  res.status(200).json({
    success: true,
    message: "User Data retrieved successfully",
    user,
  });
};

// allUser
export const allUser = async (req, res) => {
  const limit = req.query.limit || 5;
  const page = req.query.page || 1;
  const startIndex = Math.max(Number(limit) * (Number(page) - 1), 0);
  const response = await User.find({})
    .skip(startIndex)
    .limit(limit)
    .sort({ updatedAt: -1 })
    .select("-chatMessages -password");
  const totalUserCount = await User.countDocuments({});
  if (response) {
    res.status(200).json({ status: "success", totalUserCount, response });
  } else {
    res.status(400).json({ status: "failed", response: [] });
  }
};

// chatAllUser
export const chatAllUser = async (req, res) => {
  const userId = req.user._id;
  const limit = req.query.limit || 5;
  const page = req.query.page || 1;
  const startIndex = Math.max(Number(limit) * (Number(page) - 1), 0);

  const response = await User.find({
    _id: { $ne: userId },
    // $or: [
    //   { "isConnectedUsers.connectByID": userId },
    //   { "isConnectedUsers.connectToID": userId },
    // ],
  })
    .select("-password")
    .populate({
      path: "chatMessages",
      populate: {
        path: "messageIds",
        model: "messageModal",
      },
    })
    .skip(startIndex)
    .limit(limit)
    .sort({
      updatedAt: -1,
    });
  // const populatedUsers = response.map((user) => {
  //   let lastMessageId;
  //   let unseenMessages;
  //   if (user?.chatMessages?.length > 0) {
  //     const _allMessages = user?.chatMessages?.filter(
  //       (itemId) =>
  //         itemId.receiverId === userId.toString() &&
  //         itemId.senderId === user?._id.toString()
  //     );
  //     const lastMessage = _allMessages[_allMessages?.length - 1];
  //     lastMessageId = lastMessage
  //       ? lastMessage.messageIds[lastMessage?.messageIds?.length - 1]
  //       : null;
  //     const receiveUserMessages = (
  //       _allMessages?.flatMap((message) =>
  //         message?.messageIds?.filter(
  //           (itemId) => itemId?.receiverId.toString() === userId?.toString()
  //         )
  //       ) || []
  //     ).flat();
  //     unseenMessages = receiveUserMessages.filter(
  //       (message) => message.status === "unseen"
  //     );
  //   }
  //   return {
  //     ...user.toObject(),

  //     lastMessageId: lastMessageId ?? [],
  //     receiveMessages: unseenMessages?.length ?? 0,
  //   };
  // });
  if (response) {
    res.status(200).json({ status: "success", response:response });
  } else {
    res.status(400).json({ status: "failed", response: [] });
  }
};

// blockedUser
export const blockedUser = async (req, res) => {
  const userId = req.user._id;
  const { fdId } = req.body;
  const user = await User.findById(userId).select("-chatMessages -password");
  if (!user) {
    throw new CustomError("User Not Found", 404);
  }
  const isBlocked = user?.blockedUsers?.find(
    (blockedUser) => blockedUser?.blockedToID?.toString() === fdId?.toString()
  );
  if (isBlocked) {
    const response = await User.findOneAndUpdate(
      { _id: fdId },
      { $pull: { blockedUsers: { blockedToID: fdId } } },
      { new: true }
    );
    const _response = await User.findOneAndUpdate(
      { _id: userId },
      { $pull: { blockedUsers: { blockedToID: fdId } } },
      { new: true }
    );

    if (response) {
      return res.status(200).json({
        status: "success",
        message: "you unblocked this user",
        response,
      });
    } else {
      return res.status(400).json({ status: "failed", response: [] });
    }
  } else {
    const blockedUser = {
      blockedByID: userId,
      blockedStatus: true,
      blockedToID: fdId,
    };
    const response = await User.findOneAndUpdate(
      { _id: userId },
      { $push: { blockedUsers: blockedUser } },
      { new: true }
    );
    const _response = await User.findOneAndUpdate(
      { _id: fdId },
      { $push: { blockedUsers: blockedUser } },
      { new: true }
    );
    if (response) {
      res.status(200).json({
        status: "success",
        message: "you blocked this user",
        response,
      });
    } else {
      res.status(400).json({ status: "failed", response: [] });
    }
  }
};


// updateConnectedUsers
export const updateConnectedUsers = async (req, res) => {
  const userId = req.user._id;
  const { fdId } = req.body;
  if (!userId && !fdId) {
    throw new CustomError(
      "Please provide a user ID to update the connection status!",
      400
    );
  }
  const user = await User.findById(userId).select("-chatMessages -password");
  if (!user) {
    throw new CustomError("User Not Found", 404);
  }
  const isConnect = user?.isConnectedUsers?.find(
    (connectUser) => connectUser?.connectToID?.toString() === fdId?.toString()
  );
  if (isConnect) {
    return res
      .status(200)
      .json({ message: "you are Already Connected to this user" });
  }
  const ConnectUserOne = {
    connectByID: userId,
    connectStatus: true,
    connectToID: fdId,
  };
  const ConnectUserTwo = {
    connectByID: fdId,
    connectStatus: true,
    connectToID: userId,
  };

  const response = await User.findOneAndUpdate(
    { _id: userId },
    { $push: { isConnectedUsers: ConnectUserOne } },
    { new: true }
  );
  const _response = await User.findOneAndUpdate(
    { _id: fdId },
    { $push: { isConnectedUsers: ConnectUserTwo } },
    { new: true }
  );
  if (response && _response) {
    res.status(200).json({
      status: "success",
      message: "you connect to this user Successfully.!",
      response,
    });
  } else {
    res.status(400).json({ status: "failed", response: [] });
  }
};
// ---------------------------------
//   const updatedUser = await User.findByIdAndUpdate(
//     { _id: userId },
//     { isConnected: true },
//     { new: true }
//   );
//   if (!updatedUser) {
//     throw new CustomError("User not found", 404);
//   }
//   res.status(200).json({
//     message: "User connection status updated successfully",
//     user: updatedUser,
//     success: true,
//   });
// };

//delete User
export const deleteUser = async (req, res) => {
  const postRemove = await Post.remove({ author: req?.body?.userId });
  const response = await User.remove({ _id: req?.body?.userId });
  if (response?.acknowledged) {
    res.status(200).json({
      status: "success",
      response: true,
      message: "User delete SuccessFully",
    });
  } else {
    res
      .status(400)
      .json({ status: "failed", response: false, message: "User Not Deleted" });
  }
};

//generateAccessToken
export const generateAccessToken = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  const channelName = req.query.channelName;
  if (!channelName) {
    return res.status(500).json({ error: "channel is required" });
  }
  let uid = req.query.uid;
  if (!uid || uid == "") {
    uid = 0;
  }
  // get role
  let role = RtcRole.SUBSCRIBER;
  if (req.query.role == "publisher") {
    role = RtcRole.PUBLISHER;
  }
  //ext
  let expireTime = req.query.expireTime;
  if (!expireTime || expireTime == "") {
    expireTime = 3600;
  } else {
    expireTime = parseInt(expireTime, 10);
  }
  // calculate privilege expire time
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireTime;
  const token = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    channelName,
    uid,
    role,
    privilegeExpireTime
  );
  return res.json({ token: token });
};

// userCount
export const userCount = async (req, res) => {
  const userId = req.user._id;
  const user = await User.find({
    _id: { $ne: userId },
    accountType: req.params.role,
    isVerified: true,
  }).select(["-password", "-bookmarks", "-otpverification"]);

  res.status(200).json({
    success: true,
    message: "User Data retrieved successfully",
    user,
    count: user?.length,
  });
};

// handleUserSearch
// export const handleUserSearch = async (req, res) => {
//   const userId = req.user._id;
//   const limit = req.query.limit || 1;
//   const page = req.query.page || 1;
//   const startIndex = Math.max(Number(limit) * (Number(page) - 1), 0);
//   const { text, role } = req.body;
//   if (!text) {
//     const usersWithoutTextSearch = await User.find({
//       _id: { $ne: userId },
//       accountType: role,
//       isVerified: true,
//     })
//       .select(["-password", "-bookmarks", "-otpverification"])
//       .skip(startIndex)
//       .limit(Number(limit))
//       .sort({ createdAt: -1 });
//     if (usersWithoutTextSearch) {
//       return res.status(200).json({
//         message: "User Data retrieved successfully",
//         data: usersWithoutTextSearch,
//         status: "success",
//       });
//     } else {
//       return res.status(400).json({
//         message: "Failed to Get User Data retrieved",
//         data: null,
//         status: "failed",
//       });
//     }
//   } else {
//     const response = await User.find(
//       {
//         $and: [
//           {
//             accountType: role,
//           },
//           {
//             $or: [
//               { firstName: { $regex: new RegExp(`${text}`, "mgi") } },
//               { lastName: { $regex: new RegExp(`${text}`, "mgi") } },
//             ],
//           },
//         ],
//       },
//       { password: 0, otpverification: 0 }
//     )
//       .skip(startIndex)
//       .limit(Number(limit))
//       .sort({ createdAt: -1 });

//     if (response) {
//       let data = {
//         // totalPages,
//         // currentPage: page,
//         // chatMessages:[],
//         // lastMessageId:[],
//         response,
//       };
//       return res.status(200).json({
//         message: "Get All Users According To Search",
//         data: response,
//         status: "success",
//       });
//     } else {
//       return res.status(400).json({
//         message: "Failed to Get All Users According To Search",
//         data: null,
//         status: "failed",
//       });
//     }
//   }
// };

// createRating
export const createRating = async (req, res) => {
  const { userID, ratingID, ratingValue } = req.body;
  await User.updateOne(
    { _id: ratingID },
    { $pull: { ratingStart: { userID } } }
  );

  const response = await User.updateOne(
    { _id: ratingID },
    {
      $addToSet: {
        ratingStart: {
          $each: [{ userID, ratingValue }],
          $elemMatch: { userID },
        },
      },
    }
  );
  if (response) {
    const allRating = await User.findOne(
      { _id: ratingID },
      { ratingStart: 1, _id: 0 }
    );
    if (allRating) {
      const totalUser = allRating?.ratingStart?.length;
      const totalScores = allRating?.ratingStart?.reduce(
        (previousScore, currentScore, index) =>
          previousScore + currentScore?.ratingValue,
        0
      );
      const response = await User.findByIdAndUpdate(
        { _id: ratingID },
        { ratingStartValue: totalScores / totalUser }
      );

      if (response) {
        return res.status(200).json({
          message: "Rating Update Successfully",
          status: "success",
          rating: totalScores / totalUser,
        });
      } else {
        return res.status(200).json({
          message: "Rating Update Failed",
          status: "failed",
          rating: null,
        });
      }
    } else {
      return res.status(200).json({
        message: "Rating Update Failed",
        status: "failed",
        rating: null,
      });
    }
  }
};

// identifyDocument
export const identifyDocument = async (req, res) => {
  const { file } = req.body;
  let docs_for_identify = "";
  if (!file) {
    throw new CustomError("Please Provide Documents to Verify!", 400);
  }
  if (file) {
    let base64Image = file?.split(";base64,").pop();
    const buffer = Buffer.from(base64Image, "base64");
    const mimeInfo = await fileTypeFromBuffer(buffer);
    let typeExtension = mimeInfo.ext;
    const fileKey = await uploadFile(buffer, typeExtension);
    req.body.profilePic = fileKey;
    if (fileKey) docs_for_identify = fileKey;
  }
  const response = await User.findOneAndUpdate(
    { _id: req.user._id },
    {
      docs_for_identify,
      identified_docs_status: false,
      request_to_identify_docs: true,
    }
  );
  let updatedResponse = await User.findById(req.user._id);
  if (updatedResponse) {
    const adminUsers = await User.find({ accountType: "admin" });
    if (adminUsers.length > 0) {
      for (const admin of adminUsers) {
        await sendMailForapproveIdentity(admin?.email, updatedResponse);
      }
    }
    return res
      .status(200)
      .json({ message: "Your Request Send to Admin", status: true });
  } else {
    return res
      .status(200)
      .json({ message: "Your Request Send to Admin", status: true });
  }
};

// getAllRequestForIdentify
export const getAllRequestForIdentify = async (req, res) => {
  const response = await User.find({ request_to_identify_docs: true });
  if (response) {
    res.status(200).json({
      message: "Get All Request for Identification",
      status: true,
      data: response,
    });
  } else {
    res.status(400).json({
      message: "Failed to Get All Request for Identification",
      status: false,
      data: [],
    });
  }
};

// approveRequestForIdentify
export const approveRequestForIdentify = async (req, res) => {
  const { id } = req.body;
  const response = await User.findOneAndUpdate(
    { _id: id },
    {
      request_to_identify_docs: false,
      identified_docs_status: true,
    }
  );
  if (response) {
    res.status(200).json({
      message: "Identification Request of User Approve",
      status: true,
      data: response,
    });
  } else {
    res.status(400).json({
      message: "Identification Request of User to Approve Failed",
      status: false,
      data: null,
    });
  }
};

// blockedUserByAdmin
export const blockedUserByAdmin = async (req, res) => {
  const { userId } = req.body;
  const userToBlock = await User.findById(userId);
  if (!userToBlock) {
    throw new CustomError("The user was not found", 404);
  }
  userToBlock.isUserBlocked = !userToBlock.isUserBlocked;
  await userToBlock.save();
  const userData = {
    _id: userToBlock?._id,
    firstName: userToBlock?.firstName,
    lastName: userToBlock?.lastName,
    email: userToBlock?.email,
    isUserBlocked: userToBlock?.isUserBlocked,
  };
  const message = userToBlock.isUserBlocked
    ? "User blocked successfully."
    : "User unblocked successfully.";
  return res.status(200).json({ status: "success", message, user: userData });
};

export const handleUserSearch = async (req, res) => {
  const userId = req.user._id;
  const limit = req.query.limit || 10;
  const page = req.query.page || 1;
  const startIndex = Math.max(Number(limit) * (Number(page) - 1), 0);
  const { text, role, location, professionalAffiliation, rating, tools } =
    req.body;

  const baseQuery = {
    _id: { $ne: userId },
    accountType: role,
    isVerified: true,
  };

  if (text) {
    baseQuery.$or = [
      { firstName: { $regex: new RegExp(`${text}`, "i") } },
      { lastName: { $regex: new RegExp(`${text}`, "i") } },
    ];
  }

  if (location) {
    baseQuery.country = { $regex: new RegExp(`${location}`, "i") };
  }

  if (professionalAffiliation && professionalAffiliation.length > 0) {
    baseQuery.affiliatedAgency = {
      $elemMatch: { $in: professionalAffiliation },
    };
  }

  if (rating) {
    baseQuery.ratingStartValue = rating;
  }

  if (tools && tools.length > 0) {
    baseQuery.toolsUsed = { $elemMatch: { $in: tools } };
  }

  try {
    const usersWithSearchCriteria = await User.find(baseQuery)
      .select(["-password", "-bookmarks", "-otpverification"])
      .skip(startIndex)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "User Data retrieved successfully",
      data: usersWithSearchCriteria,
      status: "success",
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: "Failed to Get User Data retrieved",
      data: [],
      status: "failed",
    });
  }
};

export const userAccountTypeCounts = async (req, res) => {
  try {
    const accountTypes = ["seller", "consultant", "supplier", "admin"];
    const counts = {};

    for (const type of accountTypes) {
      const count = await User.countDocuments({ accountType: type });
      counts[type] = count;
    }
    const countTotalUser = await User.countDocuments({});
    const countTotalPost = await Post.countDocuments({});
    const countVerified = await User.countDocuments({ isVerified: true });
    const countNonVerified = await User.countDocuments({ isVerified: false });

    counts["totalUser"] = countTotalUser;
    counts["totalPost"] = countTotalPost;
    counts["verified"] = countVerified;
    counts["nonVerified"] = countNonVerified;

    res.status(200).json({
      status: "success",
      counts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Failed to retrieve account type counts",
    });
  }
};
