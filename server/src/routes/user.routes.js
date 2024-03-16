//update user Profile
import { Router } from "express";
import { catchAsync } from "../middleware/index.js";
import {
  allUser,
  UserData,
  userCount,
  deleteUser,
  chatAllUser,

  createRating,
  updateProfile,
  handleUserSearch,
  identifyDocument,
  generateAccessToken,
  updateConnectedUsers,
  getAllRequestForIdentify,
  approveRequestForIdentify,
  blockedUserByAdmin,
  userAccountTypeCounts,
} from "../controller/index.js";
import passport from "passport";
export const userRoutes = Router();

userRoutes.put(
  "/updateProfile",
  passport.authenticate("jwt", { session: false }),
  catchAsync(updateProfile)
);

// user Data
userRoutes.get(
  "/userData/:userId",
  passport.authenticate("jwt", { session: false }),
  catchAsync(UserData)
);

// userRolesData
userRoutes.get(
  "/userRolesData/:role",
  passport.authenticate("jwt", { session: false }),
  catchAsync(userCount)
);

userRoutes.get("/allUser", catchAsync(allUser));

userRoutes.get(
  "/chatAllUsers",
  passport.authenticate("jwt", { session: false }),
  catchAsync(chatAllUser)
);

userRoutes.post(
  "/connectUser",
  passport.authenticate("jwt", { session: false }),
  catchAsync(updateConnectedUsers)
);


const nocache = (req, resp, next) => {
  resp.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  resp.header("Expires", "-1");
  resp.header("Pragma", "no-cache");
  next();
};
userRoutes.get("/agoraToken", nocache, catchAsync(generateAccessToken));
userRoutes.delete(
  "/deleteUser",
  passport.authenticate("jwt", { session: false }),
  catchAsync(deleteUser)
);
userRoutes.post(
  "/search",
  passport.authenticate("jwt", { session: false }),
  catchAsync(handleUserSearch)
);

userRoutes.post(
  "/addRating",
  passport.authenticate("jwt", { session: false }),
  catchAsync(createRating)
);
userRoutes.post(
  "/blockedUserByAdmin",
  passport.authenticate("jwt", { session: false }),
  catchAsync(blockedUserByAdmin)
);
userRoutes.post(
  "/identify-docs",
  passport.authenticate("jwt", { session: false }),
  catchAsync(identifyDocument)
);

userRoutes.get(
  "/account-type-counts",
  passport.authenticate("jwt", { session: false }),
  catchAsync(userAccountTypeCounts)
);

userRoutes.get("/identify-docs", catchAsync(getAllRequestForIdentify));
userRoutes.post(
  "/approve-identify-docs",
  catchAsync(approveRequestForIdentify)
);
