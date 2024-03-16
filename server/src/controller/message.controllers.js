import mongoose from "mongoose";
import { uploadFile } from "../utils/aws.js";
import { fileTypeFromBuffer } from "file-type";
import {
  User,
  messageModal,

} from "../models/index.js";


const updateMessageData = async (result, _senderId, _receiverId) => {
  try {
    const existingChat = await User.findOne({
      chatMessages: {
        $elemMatch: {
          senderId: _senderId,
          receiverId: _receiverId,
        },
      },
    });
    if (existingChat) {
      await User.findOneAndUpdate(
        {
          chatMessages: {
            $elemMatch: {
              senderId: _senderId,
              receiverId: _receiverId,
            },
          },
        },
        {
          $push: {
            "chatMessages.$.messageIds": result._id,
          },
        },
        { new: true }
      );
    } else {
      await User.findByIdAndUpdate(
        _senderId,
        {
          $push: {
            chatMessages: {
              senderId: _senderId,
              receiverId: _receiverId,
              messageIds: [result._id],
            },
          },
        },
        { new: true }
      );
    }
    const reversedChat = await User.findOne({
      chatMessages: {
        $elemMatch: {
          senderId: _receiverId,
          receiverId: _senderId,
        },
      },
    });
    if (reversedChat) {
      await User.findOneAndUpdate(
        {
          chatMessages: {
            $elemMatch: {
              senderId: _receiverId,
              receiverId: _senderId,
            },
          },
        },
        {
          $push: {
            "chatMessages.$.messageIds": result._id,
          },
        },
        { new: true }
      );
    } else {
      await User.findByIdAndUpdate(
        _receiverId,
        {
          $push: {
            chatMessages: {
              senderId: _receiverId,
              receiverId: _senderId,
              messageIds: [result._id],
            },
          },
        },
        { new: true }
      );
    }
    return { success: true };
  } catch (e) {
    return { success: false };
  }
};
const messageQuery = (myId, fdId) => {
  return {
    $or: [
      {
        $and: [
          {
            senderId: {
              $eq: myId,
            },
          },
          {
            receiverId: {
              $eq: fdId,
            },
          },
          {
            $or: [
              {
                "deleteMessage.deleteByUser": { $ne: myId },
              },
              {
                "deleteMessage.deleteStatus": false,
              },
            ],
          },
        ],
      },
      {
        $and: [
          {
            senderId: {
              $eq: fdId,
            },
          },
          {
            receiverId: {
              $eq: myId,
            },
          },
          {
            $or: [
              {
                "deleteMessage.deleteByUser": { $ne: myId },
              },
              {
                "deleteMessage.deleteStatus": false,
              },
            ],
          },
        ],
      },
    ],
  };
};

export const messageHandler = async (req, res) => {
  const {
    receiverId,
    senderName,
    file,
    message,
    messageTime,
    _id,
    userIsOnline,
  } = req.body;
  const senderId = req?.user?._id;
  if (_id && receiverId && senderName && message && !file) {
    const result = await messageModal.create({
      _id: mongoose.Types.ObjectId(_id),
      senderId: senderId,
      author: senderId,
      senderName: senderName,
      receiverId: receiverId,
      messageTime: messageTime,
      message: {
        text: message,
      },
    });
    if (result) {
      let { success } = await updateMessageData(result, senderId, receiverId);
      if (success) {
        // const notifySetting = await NotificationSetting.find({
        //   author: result.receiverId,
        // });
        // let findSetting =
        //   notifySetting?.notificationsShown &&
        //   notifySetting?.notificationsShown.length > 0 &&
        //   notifySetting.notificationsShown.includes("message");
        // if (result.receiverId.toString() !== senderId.toString()) {
        //   // if (!findSetting) {
        //     // const newNotification = new Notification({
        //     //   notificationId: senderId,
        //     //   sender: senderId,
        //     //   receiver: result.receiverId,
        //     //   message: "You have received a new message",
        //     //   type: "message",
        //     // });
        //     // await newNotification.save();
        //     // await sendPushNotificationMiddleware(newNotification, userIsOnline);
        //   // }
        // }

        return res.status(200).json({
          message: "Message Created successfully",
          success: true,
          data: result,
        });
      } else {
        return res.status(200).json({
          message: "Message Created Failed.",
          success: true,
          data: result,
        });
      }
    } else {
      return res.status(401).json({
        message: "Message Created failed",
        success: false,
        data: null,
      });
    }
  } else if (
    _id &&
    receiverId &&
    senderName &&
    !message &&
    file &&
    +file.length > 0
  ) {
    const fileKeys = await Promise.all(
      file.map(async (file) => {
        let base64Image = file?.file?.split(";base64,").pop();
        const buffer = Buffer.from(base64Image, "base64");
        const mimeInfo = await fileTypeFromBuffer(buffer);
        let typeExtension = mimeInfo.ext;
        const fileKey = await uploadFile(buffer, typeExtension);
        return { fileKey, type: file?.type };
      })
    );
    const result = await messageModal.create({
      _id: mongoose.Types.ObjectId(_id),
      senderId: senderId,
      author: senderId,
      senderName: senderName,
      receiverId: receiverId,
      messageTime: messageTime,
      message: {
        file: fileKeys,
      },
    });
    if (result) {
      let { success } = await updateMessageData(result, senderId, receiverId);
      if (success) {
        // const notifySetting = await NotificationSetting.find({
        //   author: result.receiverId,
        // });
        // let findSetting =
        //   notifySetting?.notificationsShown &&
        //   notifySetting?.notificationsShown.length > 0 &&
        //   notifySetting.notificationsShown.includes("message");
        // if (result.receiverId.toString() !== senderId.toString()) {
        //   if (!findSetting) {
        //     const newNotification = new Notification({
        //       notificationId: senderId,
        //       sender: senderId,
        //       receiver: result.receiverId,
        //       message: "You have received a new message",
        //       type: "message",
        //     });
        //     await newNotification.save();
        //     await sendPushNotificationMiddleware(newNotification, userIsOnline);
        //   }
        // }
        return res.status(200).json({
          message: "Message Created successfully",
          success: true,
          data: result,
        });
      } else {
        return res.status(200).json({
          message: "Message Created Failed.",
          success: true,
          data: result,
        });
      }
    } else {
      return res.status(401).json({
        message: "Message Created failed",
        success: false,
        data: null,
      });
    }
  } else if (
    _id &&
    receiverId &&
    senderName &&
    message &&
    file &&
    +file.length > 0
  ) {
    const fileKeys = await Promise.all(
      file.map(async (file) => {
        let base64Image = file?.file?.split(";base64,").pop();
        const buffer = Buffer.from(base64Image, "base64");
        const mimeInfo = await fileTypeFromBuffer(buffer);
        let typeExtension = mimeInfo.ext;
        const fileKey = await uploadFile(buffer, typeExtension);
        return { fileKey, type: file?.type };
      })
    );
    req.body.message = {
      text: message,
      file: fileKeys,
    };
    const result = await messageModal.create({
      _id: mongoose.Types.ObjectId(_id),
      senderId: senderId,
      author: senderId,
      senderName: senderName,
      receiverId: receiverId,
      messageTime: messageTime,
      message: {
        text: message,
        file: fileKeys,
      },
    });
    if (result) {
      let { success } = await updateMessageData(result, senderId, receiverId);
      // const notifySetting = await NotificationSetting.find({
      //   author: result.receiverId,
      // });
      // let findSetting =
      //   notifySetting?.notificationsShown &&
      //   notifySetting?.notificationsShown.length > 0 &&
      //   notifySetting.notificationsShown.includes("message");
      // if (success) {
      //   if (result.receiverId.toString() !== senderId.toString()) {
      //     if (!findSetting) {
      //       const newNotification = new Notification({
      //         notificationId: result.senderId,
      //         sender: senderId,
      //         receiver: result.receiverId,
      //         message: "You have received a new message",
      //         type: "message",
      //       });
      //       await newNotification.save();
      //       await sendPushNotificationMiddleware(newNotification, userIsOnline);
      //     }
      //   }
        return res.status(200).json({
          message: "Message Created successfully",
          success: true,
          data: result,
        });
      } else {
        return res.status(200).json({
          message: "Message Created Failed.",
          success: true,
          data: result,
        });
      }
    } 
  //   else {
  //     return res.status(401).json({
  //       message: "Message Created failed",
  //       success: false,
  //       data: null,
  //     });
  //   // }
  // } 
  else {
    res.status(404).json({ message: "Please provide All Fields" });
  }
};

export const getMessages = async (req, res) => {
  const myId = req?.user?._id;
  const fdId = req.params.id;
  const query = messageQuery(myId, fdId);
  const response = await messageModal.find(query);
  if (response) {
    return res.status(200).json({
      message: "Get all message Successfully",
      success: true,
      data: response,
    });
  } else {
    return res.status(200).json({
      message: "Get all message Failed",
      success: false,
      data: null,
    });
  }
};

export const seenMessage = async (req, res) => {
  const myId = req?.user?._id;
  const { fdId } = req?.body;
  const response = await messageModal.find({
    $or: [
      {
        $and: [
          {
            senderId: {
              $eq: myId,
            },
          },
          {
            receiverId: {
              $eq: fdId,
            },
          },
          {
            status: "unseen",
          },
          {
            $or: [
              {
                "deleteMessage.deleteByUser": { $ne: myId },
              },
              {
                "deleteMessage.deleteStatus": false,
              },
            ],
          },
        ],
      },
      {
        $and: [
          {
            senderId: {
              $eq: fdId,
            },
          },
          {
            receiverId: {
              $eq: myId,
            },
          },
          {
            status: "unseen",
          },
          {
            $or: [
              {
                "deleteMessage.deleteByUser": { $ne: myId },
              },
              {
                "deleteMessage.deleteStatus": false,
              },
            ],
          },
        ],
      },
    ],
  });
  const allIds = response.length > 0 && response.map((item) => item._id);
  if (allIds.length > 0) {
    const result = await messageModal.updateMany(
      { _id: { $in: allIds } },
      { $set: { status: "seen" } }
    );
    if (result) {
      return res.status(200).json({
        message: "Messages Seen successfully",
        success: true,
        data: result,
      });
    } else {
      return res.status(401).json({
        message: "No messages found to update",
        success: false,
        data: null,
      });
    }
  } else {
    return res.status(401).json({
      message: "No messages found to update",
      success: false,
      data: null,
    });
  }
};

export const deleteChatMessage = async (req, res) => {
  const myId = req.user._id;
  const { fdId } = req.body;
  const query = messageQuery(myId, fdId);
  const response = await messageModal.find(query);
  const allIds = response.length > 0 && response.map((item) => item._id);
  if (allIds.length > 0) {
    const newDeleteObject = {
      deleteByUser: myId,
      deleteStatus: true,
    };
    const result = await messageModal.updateMany(
      { _id: { $in: allIds } },
      {
        $push: { deleteMessage: newDeleteObject },
      }
    );
    if (result) {
      return res.status(200).json({
        message: "Messages Delete successfully",
        success: true,
        data: result,
      });
    } else {
      return res.status(401).json({
        message: "No messages found to Delete",
        success: false,
        data: null,
      });
    }
  } else {
    return res.status(401).json({
      message: "No messages found to Delete",
      success: false,
      data: null,
    });
  }
};

export const countMessage = async (req, res) => {
  const { messageId } = req.body;
  const updatedDocument = await messageModal.findOneAndUpdate(
    { _id: messageId },
    { $inc: { unreadCount: 1 } },
    { new: true }
  );
  if (!updatedDocument) {
    return res.status(404).json({ message: "Document not found." });
  }
  return res
    .status(200)
    .json({ message: "Unread count incremented successfully." });
};

// export const callHandler = async (req, res) => {
//   const { callReceiverId, callTime, durations } = req.body;
//   const senderId = req.user._id;
//   if (!callReceiverId || !callTime || !durations) {
//     return res.status(400).json({ message: "Please provide all data" });
//   }
//   const findCalls = await callModal.findOne({
//     $or: [
//       {
//         $and: [{ callReceiverId: callReceiverId }, { callSenderId: senderId }],
//       },
//       {
//         $and: [{ callSenderId: callReceiverId }, { callReceiverId: senderId }],
//       },
//     ],
//   });
//   let newCall;
//   if (findCalls) {
//     newCall = findCalls;
//   } else {
//     newCall = await callModal.create({
//       author: mongoose.Types.ObjectId(senderId),
//       callSenderId: senderId,
//       callReceiverId,
//       callTime,
//       durations,
//     });
//   }
//   if (newCall) {
//     const existingChat = await User.findOne({
//       callHistory: {
//         $elemMatch: {
//           callSenderId: senderId,
//           callReceiverId: callReceiverId,
//         },
//       },
//     });
//     if (existingChat) {
//       await User.findOneAndUpdate(
//         {
//           callHistory: {
//             $elemMatch: {
//               callSenderId: senderId,
//               callReceiverId: callReceiverId,
//             },
//           },
//         },
//         {
//           $push: {
//             "callHistory.$.callIds": newCall?._id,
//           },
//         },
//         { new: true }
//       );
//     } else {
//       await User.findByIdAndUpdate(
//         senderId,
//         {
//           $push: {
//             callHistory: {
//               callSenderId: senderId,
//               callReceiverId: callReceiverId,
//               callIds: [newCall._id],
//             },
//           },
//         },
//         { new: true }
//       );
//     }
//     const reversedChat = await User.findOne({
//       callHistory: {
//         $elemMatch: {
//           callSenderId: callReceiverId,
//           callReceiverId: senderId,
//         },
//       },
//     });
//     if (reversedChat) {
//       await User.findOneAndUpdate(
//         {
//           callHistory: {
//             $elemMatch: {
//               callSenderId: callReceiverId,
//               callReceiverId: senderId,
//             },
//           },
//         },
//         {
//           $push: {
//             "callHistory.$.callIds": newCall._id,
//           },
//         },
//         { new: true }
//       );
//     } else {
//       await User.findByIdAndUpdate(
//         callReceiverId,
//         {
//           $push: {
//             callHistory: {
//               callSenderId: callReceiverId,
//               callReceiverId: senderId,
//               callIds: [newCall._id],
//             },
//           },
//         },
//         { new: true }
//       );
//     }
//     return res.status(201).json({
//       message: "Call created successfully",
//       success: true,
//       data: newCall,
//     });
//   } else {
//     return res.status(401).json({
//       message: "Call creation failed",
//       success: false,
//       data: null,
//     });
//   }
// };

// export const acceptedHandler = async (req, res) => {
//   const { callReceiverId, callSenderId, isAccept, callTime } = req.body;
//   if ((!callReceiverId, !callSenderId, isAccept === "")) {
//     throw new CustomError("Receiver Id and Sender Id is not defined.!", 404);
//   }

//   const call = await callModal.findOneAndUpdate(
//     {
//       $or: [
//         {
//           $and: [
//             { callReceiverId: callReceiverId },
//             { callSenderId: callSenderId },
//           ],
//         },
//         {
//           $and: [
//             { callSenderId: callReceiverId },
//             { callReceiverId: callSenderId },
//           ],
//         },
//       ],
//     },
//     {
//       isAccept: isAccept,
//       callTime: callTime,
//     }
//   );
//   if (call) {
//     return res.status(200).json({ message: "you Accepted the Call" });
//   }
//   return res.status(400).json({ message: "not Found any Coming Call." });
// };

// export const deleteCallHistory = async (req, res) => {
//   const userId = req.user._id;
//   const { fdId } = req.body;
//   try {
//     const user = await User.findById(userId);
//     const callHistoryIndex = user.callHistory.findIndex(
//       (history) =>
//         history.callReceiverId === fdId || history.callSenderId === fdId
//     );

//     if (callHistoryIndex !== -1) {
//       const callHistory = user.callHistory[callHistoryIndex];
//       const lastCallId = callHistory.callIds.pop();

//       await callModal.deleteMany({ _id: { $in: [lastCallId] } });
//       if (callHistory.callIds.length === 0) {
//         user.callHistory.splice(callHistoryIndex, 1);
//       } else {
//         user.callHistory[callHistoryIndex] = callHistory;
//       }

//       await user.save();

//       return res.status(200).json({
//         message: "Last call deleted from call history",
//         success: true,
//       });
//     } else {
//       return res.status(404).json({
//         message: "Call history not found for the given contact",
//         success: false,
//       });
//     }
//   } catch (error) {
//     return res.status(500).json({
//       message: "Error deleting call history",
//       success: false,
//       error: error.message,
//     });
//   }
// };
