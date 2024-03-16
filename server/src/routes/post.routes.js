// import { Router } from "express";
// import { catchAsync, upload } from "../middleware/index.js";
// import {
//   likes,
//   allPost,
//   createPost,
//   sharedPost,
//   getAllPosts,
//   getMyPosts,
//   bookmarks,
//   // searchPost,
//   deletePost,
//   updatePost,
//   allPostList,
//   handlePostSearch,
//   getUserBookmarks,
//   getAllPostsLikes,
//   handleGetFeedPreferences,
//   handlePostFeedPreferences,
// } from "../controller/post.controller.js";
// import passport from "passport";

// export const postRoutes = Router();

// // create
// postRoutes.post(
//   "/create",
//   passport.authenticate("jwt", { session: false }),
//   // upload.array("file"),
//   catchAsync(createPost)
// );

// //shared Post
// postRoutes.post(
//   "/sharePost",
//   passport.authenticate("jwt", { session: false }),
//   catchAsync(sharedPost)
// );

// // getAllPosts
// postRoutes.get(
//   "/getAllPosts",
//   passport.authenticate("jwt", { session: false }),
//   catchAsync(getAllPosts)
// );

// postRoutes.post(
//   "/getallUniquePostLikes",
//   passport.authenticate("jwt", { session: false }),
//   catchAsync(getAllPostsLikes)
// );

// // getUsersPosts
// postRoutes.get(
//   "/getMyPosts/:userId",
//   passport.authenticate("jwt", { session: false }),
//   catchAsync(getMyPosts)
// );

// // bookmarks
// postRoutes.get(
//   "/bookmarks/:postId",
//   passport.authenticate("jwt", { session: false }),
//   catchAsync(bookmarks)
// );

// // Likes
// postRoutes.get(
//   "/likes/:postId",
//   passport.authenticate("jwt", { session: false }),
//   catchAsync(likes)
// );

// postRoutes.get(
//   "/getUserBookmarks",
//   passport.authenticate("jwt", { session: false }),
//   catchAsync(getUserBookmarks)
// );

// //deletePost
// postRoutes.delete(
//   "/delete/:postId",
//   passport.authenticate("jwt", { session: false }),
//   catchAsync(deletePost)
// );

// // updatePost
// postRoutes.put(
//   "/update/:postId",
//   passport.authenticate("jwt", { session: false }),
//   upload.array("file"),
//   catchAsync(updatePost)
// );

// // search_post
// // postRoutes.get(
// //   "/search-post",
// //   passport.authenticate("jwt", { session: false }),
// //   catchAsync(searchPost)
// // );

// postRoutes.get(
//   "/allPost",
//   passport.authenticate("jwt", { session: false }),
//   catchAsync(allPost)
// );

// postRoutes.get(
//   "/allPostList",
//   passport.authenticate("jwt", { session: false }),
//   catchAsync(allPostList)
// );

// postRoutes.get(
//   "/search",
//   passport.authenticate("jwt", { session: false }),
//   catchAsync(handlePostSearch)
// );

// postRoutes.post(
//   "/feedPreferences",
//   passport.authenticate("jwt", { session: false }),
//   catchAsync(handlePostFeedPreferences)
// );

// postRoutes.get(
//   "/feedPreferences",
//   passport.authenticate("jwt", { session: false }),
//   catchAsync(handleGetFeedPreferences)
// );
