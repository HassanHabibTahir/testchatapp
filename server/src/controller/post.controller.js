// import mongoose from "mongoose";
// import moment from "moment";
// import { uploadFile } from "../utils/index.js";
// import { fileTypeFromBuffer } from "file-type";
// import { CustomError } from "../middleware/index.js";
// import {
//   Post,
//   User,
//   BoostPost,
//   SharedPost,
//   Notification,
//   FeedPreferences,
//   NotificationSetting,
// } from "../models/index.js";
// import { sendPushNotificationMiddleware } from "../middleware/notification.js";
// // createPost
// export const createPost = async (req, res) => {
//   const files = req.body.file;
//   const hashTags = req.body.hashtags;
//   const { fileType } = req.body;

//   if (files || files?.length > 0) {
//     const fileKeys = await Promise.all(
//       files.map(async (file) => {
//         // const type = file?.file.split(';')[0].split('/')[1];
//         let base64Image = file?.file?.split(";base64,").pop();
//         const buffer = Buffer.from(base64Image, "base64");
//         const mimeInfo = await fileTypeFromBuffer(buffer);
//         let typeExtension = mimeInfo.ext;
//         const fileKey = await uploadFile(buffer, typeExtension);
//         return { fileKey, type: file?.type };
//       })
//     );
//     req.body.file = fileKeys;
//     req.body.hashtags = hashTags.map((item) => item.trim());
//   }
//   const userId = req.user?._id;

//   const post = await Post.create({
//     ...req.body,
//     author: userId,
//     originalAuthor: userId,
//     accountType: req.user?.accountType,
//     boostPost: {
//       statusBoost: false,
//       originalPost: true,
//     },
//   });
//   const updatedData = await Post.findOne({
//     $and: [{ _id: post._id, author: userId }],
//   }).populate("author", [
//     "firstName",
//     "lastName",
//     "profilePic",
//     "accountType",
//     "country",
//     "identified_docs_status",
//   ]);

//   res.status(201).json({
//     success: true,
//     message: "Created Successfully.",
//     post: updatedData,
//   });
// };

// // updatePost
// export const updatePost = async (req, res) => {
//   const { fileType } = req.body;
//   const hashTags = req.body.hashtags;

//   const { postId, days } = req.params;
//   const post = await Post.findOne({
//     $and: [{ _id: postId, author: req?.user?._id }],
//   });
//   if (!post) {
//     throw new CustomError("You can't update this post", 401);
//   }
//   const files = req.body.file;
//   req.body.hashtags = hashTags.map((item) => item.trim());
//   // const getFileKeys = post.file.map(item => item?.fileKey.split('/').pop());
//   // if (getFileKeys.length > 0) {
//   //   for (let key in getFileKeys) {

//   //     console.log(getFileKeys?.[key], "key")
//   //     const deletBeforeFiles = await deleteAwsFile(getFileKeys?.[key])
//   //   }
//   // }
//   // const previousKey = await Post.findOne({
//   //   _id: postId,
//   //   file: { $elemMatch: { fileKey: fileKey } },
//   // });
//   // console.log(previousKey, "previous Key")
//   // let fileKeys;
//   if (files || files?.length > 0) {
//     const fileKeys = await Promise.all(
//       files.map(async (file) => {
//         let base64Image = file?.file?.split(";base64,").pop();
//         const buffer = Buffer.from(base64Image, "base64");
//         const mimeInfo = await fileTypeFromBuffer(buffer);
//         let typeExtension = mimeInfo.ext;
//         const fileKey = await uploadFile(buffer, typeExtension);
//         return { fileKey, type: file?.type };
//       })
//     );
//     req.body.file = fileKeys;
//   }
//   const updatedPost = await post.updateOne(
//     {
//       ...req.body,
//     },
//     { new: true }
//   );
//   if (!updatedPost) {
//     throw new CustomError("Post Not Found!", 404);
//   }
//   const updatedData = await Post.findOne({
//     $and: [{ _id: postId, author: req?.user?._id }],
//   }).populate("author", [
//     "firstName",
//     "lastName",
//     "profilePic",
//     "accountType",
//     "country",
//     "identified_docs_status",
//   ]);
//   res.status(200).json({
//     success: true,
//     message: "Post updated successfully",
//     data: updatedData,
//   });
// };

// const checkIsBoostedThenUpdate = async (boostItems) => {
//   try {
//     await Promise.all(
//       boostItems?.map(async (item) => {
//         const { futureTime, _id: boostItemId, post } = item;
//         let currentTime = moment().format("x");
//         let isExpired = +moment(futureTime).format("x") - +currentTime;
//         const isBoosted = isExpired >= 0;
//         const updateFields = {
//           $set: {
//             "boostPost.statusBoost": isBoosted,
//             "boostPost.originalPost": !isBoosted,
//           },
//         };
//         const boostedStatus = {
//           statusBoost: isBoosted,
//         };
//         await Promise.all([
//           BoostPost.findByIdAndUpdate(boostItemId, boostedStatus, {
//             new: true,
//           }),
//           Post.findByIdAndUpdate(post, updateFields, { new: true }),
//         ]);
//       })
//     );
//   } catch (e) {
//     console.log(e);
//   }
// };

// // getAllPosts
// export const getAllPosts = async (req, res) => {
//   const limit = req.query.limit || 5;
//   const page = req.query.page || 1;
//   const currentUser = req.user?._id;
//   const startIndex = Math.max(Number(limit) * (Number(page) - 1), 0);
//   let query = {
//     sharedPrivacy: "public",
//     // privacyStatus: "public",
//   };
//   const feedPreferences = await FeedPreferences.findOne({
//     author: req.user?._id,
//   });
//   if (feedPreferences) {
//     const { HashTags, accountType } = feedPreferences;
//     if (HashTags && +HashTags.length > 0 && accountType.length <= 0) {
//       query = {
//         ...query,
//         hashtags: { $elemMatch: { $in: HashTags } },
//       };
//     } else if (HashTags && +HashTags.length <= 0 && accountType.length > 0) {
//       query = {
//         ...query,
//         accountType: { $in: accountType },
//       };
//     } else if (+HashTags.length > 0 && +accountType.length > 0) {
//       query = {
//         ...query,
//         hashtags: { $elemMatch: { $in: HashTags } },
//         accountType: { $in: accountType },
//       };
//     } else {
//       query = {
//         ...query,
//       };
//     }
//   }
//   const findBoostPost = await BoostPost.find({
//     user: currentUser,
//     statusBoost: true,
//   });
//   if (+findBoostPost.length > 0) {
//     await checkIsBoostedThenUpdate(findBoostPost);
//   }
//   const boostedPost = await Post.find({
//     ...query,
//     sharedPrivacy: "public",
//     "boostPost.statusBoost": true,
//     "boostPost.originalPost": false,
//     "boostPost.impression": {
//       $not: {
//         $elemMatch: {
//           userId: currentUser,
//         },
//       },
//     },
//   })
//     .populate([
//       {
//         path: "comments",
//         populate: [
//           {
//             path: "author",
//             select: [
//               "firstName",
//               "lastName",
//               "profilePic",
//               "accountType",
//               "country",
//               "identified_docs_status",
//             ],
//           },
//           {
//             path: "replyComments",
//             populate: {
//               path: "author",
//               select: [
//                 "firstName",
//                 "lastName",
//                 "profilePic",
//                 "accountType",
//                 "country",
//                 "identified_docs_status",
//               ],
//             },
//           },
//         ],
//       },
//       {
//         path: "likes",
//         select: ["firstName", "lastName"],
//       },
//       {
//         path: "author",
//         select: [
//           "firstName",
//           "lastName",
//           "profilePic",
//           "accountType",
//           "country",
//           "identified_docs_status",
//         ],
//       },
//       {
//         path: "originalAuthor",
//         select: [
//           "firstName",
//           "lastName",
//           "profilePic",
//           "accountType",
//           "country",
//           "identified_docs_status",
//         ],
//       },
//     ])
//     .sort({ updatedAt: -1, likes: -1 });

//   const regularPosts = await Post.find({
//     "boostPost.statusBoost": false,
//     "boostPost.originalPost": true,
//     ...query,
//   })
//     .populate([
//       {
//         path: "comments",
//         populate: [
//           {
//             path: "author",
//             select: [
//               "firstName",
//               "lastName",
//               "profilePic",
//               "accountType",
//               "country",
//               "identified_docs_status",
//             ],
//           },
//           {
//             path: "replyComments",
//             populate: {
//               path: "author",
//               select: [
//                 "firstName",
//                 "lastName",
//                 "profilePic",
//                 "accountType",
//                 "country",
//                 "identified_docs_status",
//               ],
//             },
//           },
//         ],
//       },
//       {
//         path: "likes",
//         select: ["firstName", "lastName"],
//       },
//       {
//         path: "author",
//         select: [
//           "firstName",
//           "lastName",
//           "profilePic",
//           "accountType",
//           "country",
//           "identified_docs_status",
//         ],
//       },
//       {
//         path: "originalAuthor",
//         select: [
//           "firstName",
//           "lastName",
//           "profilePic",
//           "accountType",
//           "country",
//           "identified_docs_status",
//         ],
//       },
//       {
//         path: "boostPost",
//         select: ["statusBoost"],
//       },
//       {
//         path: "sharedPosts",
//         populate: {
//           path: "author",
//           select: [
//             "firstName",
//             "lastName",
//             "profilePic",
//             "accountType",
//             "country",
//             "identified_docs_status",
//           ],
//         },
//       },
//     ])
//     .skip(startIndex)
//     .limit(limit)
//     .sort({ updatedAt: -1, likes: -1 });
//   regularPosts.sort((a, b) => {
//     const aLatestComment = a.comments.length > 0 ? a.comments[0] : null;
//     const bLatestComment = b.comments.length > 0 ? b.comments[0] : null;
//     if (!aLatestComment && !bLatestComment) {
//       return b.updatedAt - a.updatedAt;
//     } else if (!aLatestComment) {
//       return 1;
//     } else if (!bLatestComment) {
//       return -1;
//     } else {
//       return bLatestComment.updatedAt - aLatestComment.updatedAt;
//     }
//   });

//   // console.log(regularPosts.length + "--posts--");
//   let _boostPost = boostedPost[page - 1];
//   // if (regularPosts.length <= 3) {
//   //   allPosts = regularPosts.concat(
//   //     boostedPost?.slice(0, 5 - regularPosts?.length)
//   //   );
//   // }
//   const allPosts = [];
//   // if (regularPosts) {
//   if (_boostPost) {
//     allPosts.unshift(_boostPost);
//   }
//   allPosts.push(...regularPosts);
//   // }else{
//   //   allPosts.push();
//   // }
//   // }

//   const totalPostsCount = await Post.countDocuments(query);
//   res.status(200).json({
//     success: true,
//     totalPostsCount,
//     allPosts: allPosts,
//     message:
//       allPosts.length <= 0
//         ? `No post found yet.`
//         : "Post Founded Successfully.",
//   });
// };
// // ----------------------------------------------------------------
// // export const getAllPosts = async (req, res) => {
// //   const limit = req.query.limit || 5;
// //   const page = req.query.page || 1;
// //   const currentUser = req.user?._id;
// //   const startIndex = Math.max(Number(limit) * (Number(page) - 1), 0);
// //   let query = {
// //     sharedPrivacy: "public",
// //   };
// //   const feedPreferences = await FeedPreferences.findOne({
// //     author: req.user?._id,
// //   });

// //   if (feedPreferences) {
// //     const { HashTags, accountType } = feedPreferences;
// //     if (HashTags && +HashTags.length > 0 && accountType.length <= 0) {
// //       query = {
// //         ...query,
// //         hashtags: { $elemMatch: { $in: HashTags } },
// //       };
// //     } else if (HashTags && +HashTags.length <= 0 && accountType.length > 0) {
// //       query = {
// //         ...query,
// //         accountType: { $in: accountType },
// //       };
// //     } else if (+HashTags.length > 0 && +accountType.length > 0) {
// //       query = {
// //         ...query,
// //         hashtags: { $elemMatch: { $in: HashTags } },
// //         accountType: { $in: accountType },
// //       };
// //     } else {
// //       query = {
// //         ...query,
// //       };
// //     }
// //   }

// //   const findBoostPost = await BoostPost.find({
// //     user: currentUser,
// //     statusBoost: true,
// //   });

// //   // Check if there are boosted posts and update their status
// //   if (+findBoostPost.length > 0) {
// //     await checkIsBoostedThenUpdate(findBoostPost);
// //   }

// //   // Fetch boosted posts that haven't been seen by the current user
// //   const boostedPost = await Post.find({
// //     ...query,
// //     sharedPrivacy: "public",
// //     "boostPost.statusBoost": true,
// //     "boostPost.originalPost": false,
// //     "boostPost.impression": {
// //       $not: {
// //         $elemMatch: {
// //           userId: currentUser,
// //         },
// //       },
// //     },
// //   })
// //     .populate([
// //       {
// //         path: "comments",
// //         populate: [
// //           {
// //             path: "author",
// //             select: [
// //               "firstName",
// //               "lastName",
// //               "profilePic",
// //               "accountType",
// //               "country",
// //               "identified_docs_status",
// //             ],
// //           },
// //           {
// //             path: "replyComments",
// //             populate: {
// //               path: "author",
// //               select: [
// //                 "firstName",
// //                 "lastName",
// //                 "profilePic",
// //                 "accountType",
// //                 "country",
// //                 "identified_docs_status",
// //               ],
// //             },
// //           },
// //         ],
// //       },
// //       {
// //         path: "likes",
// //         select: ["firstName", "lastName"],
// //       },
// //       {
// //         path: "author",
// //         select: [
// //           "firstName",
// //           "lastName",
// //           "profilePic",
// //           "accountType",
// //           "country",
// //           "identified_docs_status",
// //         ],
// //       },
// //       {
// //         path: "originalAuthor",
// //         select: [
// //           "firstName",
// //           "lastName",
// //           "profilePic",
// //           "accountType",
// //           "country",
// //           "identified_docs_status",
// //         ],
// //       },
// //     ])
// //     .sort({ updatedAt: -1, likes: -1 });

// //   // Get the boosted post for the current page
// //   let _boostPost = boostedPost[page - 1];

// //   // Fetch regular posts for the current page
// //   const regularPosts = await Post.find({
// //     "boostPost.statusBoost": false,
// //     "boostPost.originalPost": true,
// //     ...query,
// //   })
// //     .populate([
// //       {
// //         path: "comments",
// //         populate: [
// //           {
// //             path: "author",
// //             select: [
// //               "firstName",
// //               "lastName",
// //               "profilePic",
// //               "accountType",
// //               "country",
// //               "identified_docs_status",
// //             ],
// //           },
// //           {
// //             path: "replyComments",
// //             populate: {
// //               path: "author",
// //               select: [
// //                 "firstName",
// //                 "lastName",
// //                 "profilePic",
// //                 "accountType",
// //                 "country",
// //                 "identified_docs_status",
// //               ],
// //             },
// //           },
// //         ],
// //       },
// //       {
// //         path: "likes",
// //         select: ["firstName", "lastName"],
// //       },
// //       {
// //         path: "author",
// //         select: [
// //           "firstName",
// //           "lastName",
// //           "profilePic",
// //           "accountType",
// //           "country",
// //           "identified_docs_status",
// //         ],
// //       },
// //       {
// //         path: "originalAuthor",
// //         select: [
// //           "firstName",
// //           "lastName",
// //           "profilePic",
// //           "accountType",
// //           "country",
// //           "identified_docs_status",
// //         ],
// //       },
// //       {
// //         path: "boostPost",
// //         select: ["statusBoost"],
// //       },
// //       {
// //         path: "sharedPosts",
// //         populate: {
// //           path: "author",
// //           select: [
// //             "firstName",
// //             "lastName",
// //             "profilePic",
// //             "accountType",
// //             "country",
// //             "identified_docs_status",
// //           ],
// //         },
// //       },
// //     ])
// //     .skip(startIndex)
// //     .limit(limit)
// //     .sort({ updatedAt: -1, likes: -1 });
// //   regularPosts.sort((a, b) => {
// //     const aLatestComment = a.comments.length > 0 ? a.comments[0] : null;
// //     const bLatestComment = b.comments.length > 0 ? b.comments[0] : null;
// //     if (!aLatestComment && !bLatestComment) {
// //       return b.updatedAt - a.updatedAt;
// //     } else if (!aLatestComment) {
// //       return 1;
// //     } else if (!bLatestComment) {
// //       return -1;
// //     } else {
// //       return bLatestComment.updatedAt - aLatestComment.updatedAt;
// //     }
// //   });

// //   // Sort regular posts based on your criteria

// //   // Combine boosted and regular posts
// //   const allPosts = [];
// //   if (regularPosts.length > 0) {
// //     if (_boostPost) {
// //       allPosts.unshift(_boostPost);
// //     }
// //     allPosts.push(...regularPosts);
// //   }

// //   // Count the total number of posts that match the query
// //   const totalPostsCount = await Post.countDocuments(query);

// //   // Return the response
// //   res.status(200).json({
// //     success: true,
// //     totalPostsCount,
// //     allPosts: allPosts,
// //     message:
// //       allPosts.length <= 0 ? `No post found yet.` : "Posts Found Successfully.",
// //   });
// // };

// // ----------------------------------------------------------------

// // get Unique post Likes .
// export const getAllPostsLikes = async (req, res) => {
//   const { postId } = req.body;
//   const perPage = req.query.limit || 10;
//   const page = req.query.page || 1;
//   const uniquePost = await Post.findById({ _id: postId })
//     .populate([
//       {
//         path: "likes",
//         select: [
//           "firstName",
//           "lastName",
//           "profilePic",
//           "accountType",
//           "country",
//         ],
//       },
//     ])
//     .select("_id likes");
//   if (!uniquePost) {
//     return res.status(404).json({
//       success: false,
//       message: "Post not found.",
//     });
//   }
//   const totalLikes = uniquePost.likes.length;
//   const totalPages = Math.ceil(totalLikes / perPage);
//   const currentPage = page || 1;
//   const skip = (currentPage - 1) * perPage;
//   const paginatedLikes = uniquePost.likes.slice(skip, skip + perPage);

//   res.status(200).json({
//     success: true,
//     uniquePost: {
//       likes: paginatedLikes,
//       totalLikes: totalPages,
//       postId: postId,
//     },
//     message: "Post Likes Retrieved Successfully.",
//   });
// };

// // sharedPost
// export const sharedPost = async (req, res, next) => {
//   const { originalPostId, caption, sharedPrivacy, sharedTime } = req.body;
//   const originalPost = await Post.findById(originalPostId);
//   const sharer = req?.user?._id;
//   if (!originalPost) {
//     throw new CustomError("Original post  not found!", 404);
//   }
//   const existingSharedPost = await SharedPost.findOne({
//     originalPost: originalPostId,
//     author: sharer,
//   });
//   if (existingSharedPost) {
//     return res
//       .status(400)
//       .json({ message: "Post already shared by this user" });
//   }
//   if (
//     originalPost?.originalAuthor.toString() === sharer.toString() ||
//     originalPost?.author.toString() === sharer.toString()
//   ) {
//     return res.status(400).json({ message: "You cannot share your own post" });
//   }
//   const { text, file, fileType, hashtags, country, originalAuthor } =
//     originalPost;
//   const data = new Post({
//     caption,
//     text,
//     file,
//     fileType,
//     hashtags,
//     country,
//     originalAuthor,
//     sharedTime,
//     author: sharer,
//     originalAuthor,
//     privacyStatus: sharedPrivacy,
//     sharedPrivacy: sharedPrivacy,
//     boostPost: {
//       originalPost: true,
//     },
//   });
//   let newPost = await data.save();
//   const newSharedPost = new SharedPost({
//     copyPostId: newPost._id,
//     originalPost: originalPostId,
//     author: sharer,
//     caption,
//   });
//   let _sharedPost = await newSharedPost.save();

//   await originalPost.updateOne(
//     {
//       $push: {
//         sharedPosts: _sharedPost._id,
//         myShared: sharer,
//       },
//     },
//     { new: true }
//   );
//   const sharedPost = await Post.findOne({
//     _id: _sharedPost?.copyPostId,
//   }).populate([
//     {
//       path: "comments",
//       populate: [
//         {
//           path: "author",
//           select: [
//             "firstName",
//             "lastName",
//             "profilePic",
//             "accountType",
//             "country",
//             "identified_docs_status",
//           ],
//         },
//         {
//           path: "replyComments",
//           populate: {
//             path: "author",
//             select: [
//               "firstName",
//               "lastName",
//               "profilePic",
//               "accountType",
//               "country",
//               "identified_docs_status",
//             ],
//           },
//         },
//       ],
//     },
//     {
//       path: "likes",
//       select: ["firstName", "lastName"],
//     },
//     {
//       path: "author",
//       select: [
//         "firstName",
//         "lastName",
//         "profilePic",
//         "accountType",
//         "country",
//         "identified_docs_status",
//       ],
//     },
//     {
//       path: "originalAuthor",
//       select: [
//         "firstName",
//         "lastName",
//         "profilePic",
//         "accountType",
//         "country",
//         "identified_docs_status",
//       ],
//     },
//     {
//       path: "boostPost",
//       select: ["statusBoost"],
//     },
//     {
//       path: "sharedPosts",
//       populate: {
//         path: "author",
//         select: [
//           "firstName",
//           "lastName",
//           "profilePic",
//           "accountType",
//           "country",
//           "identified_docs_status",
//         ],
//       },
//     },
//   ]);
//   const notifySetting = await NotificationSetting.find({
//     author: sharedPost?.originalAuthor,
//   });
//   let findSetting =
//     notifySetting?.notificationsShown &&
//     notifySetting?.notificationsShown.length > 0 &&
//     notifySetting.notificationsShown.includes("sharedPost");
//   if (sharedPost?.author.toString() !== sharer.toString()) {
//     if (!findSetting) {
//       const newNotification = new Notification({
//         notificationId: newPost._id,
//         sender: sharer,
//         receiver: sharedPost?.originalAuthor,
//         message: "Your post is shared.",
//         type: "post",
//       });
//       await newNotification.save();
//       await sendPushNotificationMiddleware(newNotification);
//     }
//   }

//   res.status(201).json({
//     success: true,
//     message: "Shared post created successfully",
//     sharedPost: sharedPost,
//   });
//   if (!_sharedPost) {
//     return res.status(500).json({ message: "Failed to create shared post" });
//   }
//   // if (files || files?.length > 0) {
//   //   const fileKeys = await Promise.all(
//   //     files.map(async (file) => {
//   //       let base64Image = file?.file?.split(";base64,").pop();
//   //       const buffer = Buffer.from(base64Image, "base64");
//   //       const fileKey = await uploadFile(buffer);
//   //       return { fileKey, type: file?.type };
//   //     })
//   //   );
//   //   req.body.file = fileKeys;
//   // }
//   // const userId = req.user?._id;
//   // const post = await Post.create({
//   //   ...req.body,
//   //   author: userId,
//   // });
//   // const updatedData = await Post.findOne({
//   //   $and: [{ _id: post._id, author: userId }],
//   // }).populate('author', ["firstName", "lastName", "profilePic", "accountType"])

//   // res.status(201).json({
//   //   success: true,
//   //   message: "Created Successfully.",
//   //   post: updatedData,
//   // });
// };

// // getMyPosts
// export const getMyPosts = async (req, res) => {
//   const limit = req.query.limit || 5;
//   const page = req.query.page || 1;
//   const startIndex = Math.max(Number(limit) * (Number(page) - 1), 0);
//   const user = req?.params?.userId;
//   const findUser = await User.findById(user);
//   if (!findUser) {
//     throw new CustomError("User not found", 404);
//   }
//   const userPosts = await Post.find({
//     author: user,
//   })
//     .populate([
//       {
//         path: "comments",
//         populate: [
//           {
//             path: "author",
//             select: [
//               "firstName",
//               "lastName",
//               "profilePic",
//               "identified_docs_status",
//             ],
//           },
//           {
//             path: "replyComments",
//             populate: {
//               path: "author",
//               select: [
//                 "firstName",
//                 "lastName",
//                 "profilePic",
//                 "identified_docs_status",
//               ],
//             },
//           },
//         ],
//       },
//       {
//         path: "likes",
//         select: ["firstName", "lastName"],
//       },
//       {
//         path: "author",
//         select: [
//           "firstName",
//           "lastName",
//           "profilePic",
//           "accountType",
//           "country",
//           "identified_docs_status",
//         ],
//       },
//       {
//         path: "originalAuthor",
//         select: [
//           "firstName",
//           "lastName",
//           "profilePic",
//           "accountType",
//           "country",
//           "identified_docs_status",
//         ],
//       },
//     ])
//     .skip(startIndex)
//     .limit(limit)
//     .sort({ updatedAt: -1 });
//   // const filteredUserPosts = userPosts.map((post, i) => {
//   //   post.sharedPosts = post.sharedPosts.filter(
//   //     (sharedPost) => sharedPost.author._id.toString() === user
//   //   )
//   //   post.myShared = post.myShared.map((shared) => shared.toString()).filter((_shared) => _shared === user)
//   //   return post;
//   // });

//   res.status(200).json({
//     success: true,
//     posts: userPosts,
//   });
// };

// // bookmarks
// export const bookmarks = async (req, res) => {
//   const { postId } = req.params;
//   const findPost = await Post.findById(postId);
//   if (!findPost) {
//     throw new CustomError("Post does not found", 404);
//   }
//   const userId = req.user._id;
//   if (findPost.bookmarks.includes(userId)) {
//     await findPost.updateOne({ $pull: { bookmarks: userId } });
//     const getBookMarkPost = await Post.findById(postId);
//     return res.status(200).json({
//       success: true,
//       message: "remove successfully",
//       post: getBookMarkPost,
//     });
//   } else {
//     await findPost.updateOne(
//       {
//         $push: { bookmarks: userId },
//       },
//       { new: true }
//     );
//     const getBookMarkPost = await Post.findById(postId);
//     return res.status(200).json({
//       success: true,
//       message: "bookmark successfully",
//       post: getBookMarkPost,
//     });
//   }
// };

// //getUserBookmarks
// export const getUserBookmarks = async (req, res) => {
//   const { _id } = req.user;
//   const limit = req.query.limit || 5;
//   const page = req.query.page || 1;
//   const startIndex = Math.max(Number(limit) * (Number(page) - 1), 0);

//   const foundPosts = await Post.find({ bookmarks: { $in: _id } })
//     .populate([
//       {
//         path: "comments",
//         populate: [
//           {
//             path: "author",
//             select: [
//               "firstName",
//               "lastName",
//               "profilePic",
//               "identified_docs_status",
//             ],
//           },
//           {
//             path: "replyComments",
//             populate: {
//               path: "author",
//               select: [
//                 "firstName",
//                 "lastName",
//                 "profilePic",
//                 "identified_docs_status",
//               ],
//             },
//           },
//         ],
//       },
//       {
//         path: "likes",
//         select: ["firstName", "lastName"],
//       },
//       {
//         path: "author",
//         select: [
//           "firstName",
//           "lastName",
//           "profilePic",
//           "identified_docs_status",
//         ],
//       },
//     ])
//     .skip(startIndex)
//     .limit(limit);
//   res.status(200).json({
//     success: true,
//     message: "UserBookmarks successfully",
//     foundPosts,
//   });
// };

// //likes and dislike
// export const likes = async (req, res) => {
//   const { postId } = req.params;
//   const findPost = await Post.findById(postId);

//   if (!findPost) {
//     throw new CustomError("Post does not found", 404);
//   }
//   const userId = req.user._id;

//   if (findPost.likes.includes(userId)) {
//     await findPost.updateOne({ $pull: { likes: userId } });
//     const getDisLikesPost = await Post.findById(postId);
//     res.status(200).json({
//       success: true,
//       message: "Disliked successfully",
//       likeCount: getDisLikesPost?.likes.length,
//       post: getDisLikesPost,
//     });
//   } else {
//     await findPost.updateOne(
//       {
//         $push: { likes: userId },
//       },
//       { new: true }
//     );

//     const getLikesPost = await Post.findById(postId);
//     const notifySetting = await NotificationSetting.findOne({
//       author: getLikesPost.author,
//     });

//     let findSetting =
//       notifySetting?.notificationsShown &&
//       notifySetting?.notificationsShown.length > 0 &&
//       notifySetting.notificationsShown.includes("like");

//     if (getLikesPost.author.toString() !== userId.toString()) {
//       if (!findSetting) {
//         const newNotification = new Notification({
//           notificationId: getLikesPost._id,
//           sender: userId,
//           receiver: getLikesPost.author,
//           message: "Your post received a like",
//           type: "post",
//         });
//         await newNotification.save();
//         await sendPushNotificationMiddleware(newNotification);
//       }
//     }

//     res.status(200).json({
//       success: true,
//       message: "Liked successfully",
//       likeCount: getLikesPost?.likes.length,
//       post: getLikesPost,
//     });
//   }
// };
// // --------
// // export const likes = async (req, res) => {
// //   const { postId } = req.params;

// //   const findPost = await Post.findById(postId);

// //   if (!findPost) {
// //     throw new CustomError("Post does not found", 404);
// //   }
// //   const userId = req.user._id;

// //   if (findPost.likes.includes(userId)) {
// //     await findPost.updateOne({ $pull: { likes: userId } });
// //     const getDisLikesPost = await Post.findById(postId);
// //     if (getDisLikesPost.author !== userId) {
// //       const newNotification = new Notification({
// //         sender: userId,
// //         receiver: getDisLikesPost.author,
// //         message: "Your post received a dislike.",
// //       });
// //       await newNotification.save();
// //       await sendPushNotificationMiddleware(newNotification);
// //       res.status(200).json({
// //         success: true,
// //         message: "Disliked successfully",
// //         likeCount: getDisLikesPost?.likes.length,
// //         post: getDisLikesPost,
// //       });
// //     } else {
// //       await findPost.updateOne(
// //         {
// //           $push: { likes: userId },
// //         },
// //         { new: true }
// //       );

// //       const getLikesPost = await Post.findById(postId);
// //       await sendPushNotificationMiddleware(newNotification);
// //       res.status(200).json({
// //         success: true,
// //         message: "Liked successfully",
// //         likeCount: getLikesPost?.likes.length,
// //         post: getLikesPost,
// //       });
// //     }
// //   }
// // };
// //delete post
// export const deletePost = async (req, res) => {
//   const { postId } = req.params;
//   if (!postId || postId == undefined) {
//     throw new CustomError("Please Provide postId", 401);
//   }

//   const findPost = await Post.findOne({
//     _id: mongoose.Types.ObjectId(postId),
//   });

//   if (!findPost) {
//     throw new CustomError("User / Post does not found", 401);
//   }

//   const deletedPost = await SharedPost.findOneAndDelete({
//     copyPostId: postId,
//   });

//   const deletedBoostPost = await BoostPost.findOneAndDelete({
//     _id: findPost?.boostPost?.boostId,
//   });

//   if (deletedPost) {
//     await Post.updateOne(
//       { _id: deletedPost?.originalPost },
//       {
//         $pull: {
//           sharedPosts: deletedPost?._id,
//           myShared: req?.user?.id,
//         },
//       },
//       { new: true }
//     );
//   }
//   await findPost.deleteOne();
//   return res.status(200).json({
//     success: true,
//     message: "Post Deleted",
//     data: findPost,
//   });
// };

// // allPost
// export const allPost = async (req, res) => {
//   const allPost = await Post.find().count();
//   if (allPost) {
//     res
//       .status(200)
//       .json({ message: "all Posts", status: "success", posts: allPost });
//   } else {
//     res
//       .status(400)
//       .json({ message: "filed to get Post", status: "failed", posts: 0 });
//   }
// };

// // allPostList
// export const allPostList = async (req, res) => {
//   const allPost = await Post.find();
//   if (allPost) {
//     res
//       .status(200)
//       .json({ message: "all Posts", status: "success", posts: allPost });
//   } else {
//     res
//       .status(400)
//       .json({ message: "filed to get Post", status: "failed", posts: [] });
//   }
// };

// // searchPost
// // export const searchPost = async (req, res) => {
// //   const { text } = req.query;
// //   const allPosts = await Post.find();
// //   const regex = new RegExp(text, "i");
// //   const posts = allPosts.filter(
// //     (post) => regex.test(post.text) || regex.test(post.caption)
// //   );
// //   if (posts.length === 0) {
// //     throw new CustomError("Post Not Found!", 404);
// //   }
// //   res.status(201).json({
// //     success: true,
// //     message: "Search post successful",
// //     posts,
// //   });
// // };

// // handlePostSearch
// export const handlePostSearch = async (req, res) => {
//   const limit = req.query.limit || 30;
//   const page = req.query.page || 1;
//   const startIndex = Math.max(Number(limit) * (Number(page) - 1), 0);
//   const { text } = req.query;

//   // caption
//   const totalDocuments = await Post.countDocuments({
//     $or: [
//       { text: { $regex: new RegExp(text, "i") } },
//       { caption: { $regex: new RegExp(text, "i") } },
//     ],
//   });
//   const totalPages = Math.ceil(totalDocuments / limit);
//   const response = await Post.find({
//     $or: [
//       { text: { $regex: new RegExp(text, "i") } },
//       { caption: { $regex: new RegExp(text, "i") } },
//     ],
//   })
//     .populate([
//       {
//         path: "comments",
//         populate: [
//           {
//             path: "author",
//             select: [
//               "firstName",
//               "lastName",
//               "profilePic",
//               "identified_docs_status",
//             ],
//           },
//           {
//             path: "replyComments",
//             populate: {
//               path: "author",
//               select: [
//                 "firstName",
//                 "lastName",
//                 "profilePic",
//                 "identified_docs_status",
//               ],
//             },
//           },
//         ],
//       },
//       {
//         path: "likes",
//         select: ["firstName", "lastName"],
//       },
//       {
//         path: "author",
//         select: [
//           "firstName",
//           "lastName",
//           "profilePic",
//           "accountType",
//           "country",
//           "identified_docs_status",
//         ],
//       },
//     ])
//     .skip(startIndex)
//     .limit(Number(limit))
//     .sort({ updatedAt: -1 });

//   if (response) {
//     let data = {
//       totalPages,
//       currentPage: page,
//       response,
//     };
//     return res.status(200).json({
//       message: "Get All Post According To Search",
//       data,
//       status: "success",
//     });
//   } else {
//     return res.status(400).json({
//       message: "Failed to Get All Post According To Search",
//       data: null,
//       status: "failed",
//     });
//   }
// };

// // handlePostFeedPreferences
// export const handlePostFeedPreferences = async (req, res) => {
//   const { HashTags, accountType } = req.body;
//   if (!HashTags && !accountType) {
//     throw new CustomError("Please Provide Hash Tags and AccountType", 401);
//   }
//   const author = req.user._id;
//   const findPreferences = await FeedPreferences.findOne({ author });
//   if (findPreferences) {
//     const filter = { _id: findPreferences._id };
//     const update = {
//       $set: {
//         HashTags: [...HashTags],
//         accountType: accountType,
//       },
//     };
//     await FeedPreferences.findOneAndUpdate(filter, update, { new: true });
//     const _findPreferences = await FeedPreferences.findOne({ author });
//     res.status(200).json({
//       success: true,
//       message: "Found preferences and update",
//       data: _findPreferences,
//     });
//   } else {
//     let feeds = {
//       author,
//       HashTags,
//       accountType,
//     };
//     const postFeed = new FeedPreferences(feeds);
//     await postFeed.save();
//     return res
//       .status(201)
//       .json({ status: true, message: "Feed preferences saved successfully" });
//   }
// };

// // handleGetFeedPreferences
// export const handleGetFeedPreferences = async (req, res) => {
//   const author = req.user._id;
//   if (!author) {
//     throw new CustomError("User not found", 404);
//   }

//   const feedPreferences = await FeedPreferences.findOne({ author });
//   if (!feedPreferences) {
//     throw new CustomError("Feed preferences not found for the user", 404);
//   }
//   return res.status(200).json({ data: feedPreferences, success: true });
// };
