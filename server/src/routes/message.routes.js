import {
  getMessages,
  seenMessage,
  countMessage,
  blockedUser,
//   callHandler,
  messageHandler,
  deleteChatMessage,


} from "../controller/index.js";
import passport from "passport";
import { Router } from "express";
import { catchAsync } from "../middleware/handleErrors.js";

export const messageRoute = Router();

messageRoute.post(
  "/message",
  passport.authenticate("jwt", { session: false }),
  catchAsync(messageHandler)
);

messageRoute.get(
  "/message/:id",
  passport.authenticate("jwt", { session: false }),
  catchAsync(getMessages)
);

messageRoute.post(
  "/count-message",
  passport.authenticate("jwt", { session: false }),
  catchAsync(countMessage)
);

// messageRoute.post(
//   "/call",
//   passport.authenticate("jwt", { session: false }),
//   catchAsync(callHandler)
// );

messageRoute.post(
  "/blockedUser",
  passport.authenticate("jwt", { session: false }),
  catchAsync(blockedUser)
);

messageRoute.post(
  "/seenMessage",
  passport.authenticate("jwt", { session: false }),
  catchAsync(seenMessage)
);

messageRoute.post(
  "/deleteMessage",
  passport.authenticate("jwt", { session: false }),
  catchAsync(deleteChatMessage)
);

// messageRoute.post(
//   "/deleteCallHistory",
//   passport.authenticate("jwt", { session: false }),
//   catchAsync(deleteCallHistory)
// );

// messageRoute.post(
//   "/acceptCall",
//   passport.authenticate("jwt", { session: false }),
//   catchAsync(acceptedHandler)
// );
