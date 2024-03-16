import { Router } from "express";
import { catchAsync } from "../middleware/index.js";
import {
  login,
  logout,
  getUser,
  register,
  changeEmail,
  forgetPassword,
  verificationOTP,
  changePassword,
  verifyEmailChange,
  changeAppPassword,
  verificationOTPForSignup,
  resendOTP,
} from "../controller/auth.controller.js";
import passport from "passport";
export const authRoutes = Router();

// Register
authRoutes.post("/register", catchAsync(register));

// Login
authRoutes.post("/login", catchAsync(login));

// resendOTP
authRoutes.post("/resendOTP", catchAsync(resendOTP));

// forgot-password
authRoutes.post("/forgot-password", catchAsync(forgetPassword));

// verification otp
authRoutes.post("/otpVerification", catchAsync(verificationOTP));

// verification otp for signup
authRoutes.post(
  "/otpVerification-signup",
  catchAsync(verificationOTPForSignup)
);

// change-password
authRoutes.post("/change-password", catchAsync(changePassword));
authRoutes.post("/changeAppPassword", catchAsync(changeAppPassword));

// get-user
authRoutes.get(
  "/getUser",
  passport.authenticate("jwt", { session: false }),
  catchAsync(getUser)
);

// changeEmail
authRoutes.post(
  "/changeEmail",
  passport.authenticate("jwt", { session: false }),
  catchAsync(changeEmail)
);

// verifyChangeEmail
authRoutes.post(
  "/verifyEmailChange",
  passport.authenticate("jwt", { session: false }),
  catchAsync(verifyEmailChange)
);

// logout
authRoutes.post("/logout", catchAsync(logout));
