import {
  logIn,
  BadRequest,
  CustomError,
  sendOptMailForResetPass,
  sendVerificationMailForSignUp,
} from "../middleware/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/user.js";
import otpGenerator from "otp-generator";

const { APP_SECRET } = process.env;

// Register
export const register = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    accountType,
    // country,
    // deviceToken,
  } = req.body;
  if (
    !firstName ||
    !email ||
    !password ||
    !accountType ||
    !lastName 
    // !country
    // ||!deviceToken
  ) {
    throw new BadRequest("Please enter all the required data");
  }
  const checkUser = await User.findOne({ email });
  if (checkUser) {
    throw new CustomError("Email Already in use", 409);
  }
  const otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
    digits: true,
  });
  const timestamp = Date.now() + 900000; //15 minutes
  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    accountType,
    // country,
    // deviceToken,
    otpverification: { otp, expiry: new Date(timestamp) },
  });
console.log( firstName,
  lastName,
  email,
  password,
  accountType);

  // await sendVerificationMailForSignUp(email, otp);
  user.password = undefined;
  res.status(201).json({
    success: true,
    message: "Please Check Your Email For Confirmation.",
  });
};

// verification otp for sign up
export const verificationOTPForSignup = async (req, res) => {
  const { otp } = req.body;
  const findUser = await User.findOne({ "otpverification.otp": otp });
  if (!findUser) {
    throw new CustomError(
      "The OTP you entered is incorrect. Please try again.",
      404
    );
  }
  const currentTimestamp = Date.now();
  let expiredTime = findUser?.otpverification?.expiry;
  if (expiredTime < currentTimestamp) {
    throw new CustomError("The OTP Expired", 403);
  }

  const user = await User.findByIdAndUpdate(
    { _id: findUser?._id },
    { otpverification: { otp: "", expiry: "" }, isVerified: true },
    { new: true }
  );
  const token = await logIn({ _id: user?._id });

  res.status(200).json({
    success: true,
    user,
    token,
    expiredTime,
  });
};

// User LogIn
export const login = async (req, res) => {
  console.log(req.body);
  const { email, password, country, deviceToken } = req.body;
  if (!email || !password) {
    throw new BadRequest("Please enter all the required data");
  }
  const user = await User.findOne({ email }).select("-otpverification  ");
  const timestamp = Date.now() + 900000;
  if (!user) {
    throw new CustomError(
      "The email you provided is either incorrect or not registered.",
      401
    );
  }
  if (!(await user.matchesPassword(password))) {
    throw new CustomError("The password you provided is incorrect.", 401);
  }

  // if (deviceToken && deviceToken !== user.deviceToken) {
  //   let _updateUser = await User.findOneAndUpdate(
  //     { email: email },
  //     {
  //       $set: { deviceToken: deviceToken },
  //     },
  //     { new: true }
  //   );
  //   if (!_updateUser) {
  //     throw new CustomError("The email you provided is incorrect.", 401);
  //   }
  // }
  // if (country) {
  //   let _updateUser = await User.findOneAndUpdate(
  //     { email: email },
  //     {
  //       $set: { country: country },
  //     },
  //     { new: true }
  //   );
  //   if (!_updateUser) {
  //     throw new CustomError("The email you provided is incorrect.", 401);
  //   }
  // }
  // if (!user.isVerified) {
  //   const otp = otpGenerator.generate(6, {
  //     upperCaseAlphabets: false,
  //     specialChars: false,
  //     lowerCaseAlphabets: false,
  //     digits: true,
  //   });
  //   const filter = { email: email };
  //   const update = {
  //     otpverification: { otp: otp, expiry: new Date(timestamp) },

  //     isVerified: false,
  //   };
  //   const updateOtp = await User.findOneAndUpdate(filter, update);

  //   await sendVerificationMailForSignUp(email, otp);
  //   return res.status(200).json({
  //     success: true,
  //     message: "Please Check Your Email For Confirmation.",
  //     isVerified: false,
  //   });
  // }

  const token = await logIn({ _id: user?._id });
  user.password = undefined;
  const filteredUser = Object.entries(user.toObject()).reduce(
    (acc, [key, value]) => {
      if (Array.isArray(value) && value.length === 0) {
        return acc;
      }
      return {
        ...acc,
        [key]: value,
      };
    },
    {}
  );
  res.status(200).json({
    success: true,
    message: "Login Successfully!",
    token,
    user: filteredUser,
  });
};

// resend OTP
export const resendOTP = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new BadRequest("Please enter all the required data");
  }
  const user = await User.findOne({ email }).select("-otpverification  ");
  const timestamp = Date.now() + 900000;
  if (!user) {
    throw new CustomError("The email you provided is incorrect.", 401);
  }

  if (!user.isVerified) {
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
      digits: true,
    });
    const filter = { email: email };
    const update = {
      otpverification: { otp: otp, expiry: new Date(timestamp) },

      isVerified: false,
    };
    const updateOtp = await User.findOneAndUpdate(filter, update);

    await sendVerificationMailForSignUp(email, otp);
    return res.status(200).json({
      success: true,
      message: "Please Check Your Email For Confirmation.",
      isVerified: false,
    });
  }
  const token = await logIn({ _id: user?._id });
  user.password = undefined;
  const filteredUser = Object.entries(user.toObject()).reduce(
    (acc, [key, value]) => {
      if (Array.isArray(value) && value.length === 0) {
        return acc;
      }
      return {
        ...acc,
        [key]: value,
      };
    },
    {}
  );
  res.status(200).json({
    success: true,
    message: "Login Successfully!",
    token,
    user: filteredUser,
  });
};

// forgetPassword
export const forgetPassword = async (req, res) => {
  const { email } = req.body;
  const findUser = await User.findOne({ email });
  if (!findUser) {
    throw new CustomError(
      "The email you provided is either incorrect or not registered.",
      404
    );
  }

  const otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
    digits: true,
  });

  const timestamp = Date.now() + 300000; //5 minutes

  await User.findByIdAndUpdate(
    { _id: findUser?._id },
    { otpverification: { otp, expiry: new Date(timestamp) } }
  );
  await sendOptMailForResetPass(email, otp);
  res.status(200).json({
    success: true,
    message: "Please Check Your Email For Confirmation",
    timestamp,
  });
};

// verification otp
export const verificationOTP = async (req, res) => {
  const { otp } = req.body;

  const findUser = await User.findOne({ "otpverification.otp": otp });
  if (!findUser) {
    throw new CustomError(
      "The OTP you entered is incorrect. Please try again.",
      404
    );
  }
  const currentTimestamp = Date.now();
  if (findUser?.otpverification.expiry < currentTimestamp) {
    throw new CustomError("OTP Expired", 403);
  }

  const token = jwt.sign(findUser?._id?.toString(), APP_SECRET);

  await User.findByIdAndUpdate(
    { _id: findUser?._id },
    { otpverification: { otp: "", expiry: "" } }
  );

  res.status(200).json({
    success: true,
    token,
  });
};

// changeEmail
export const changeEmail = async (req, res) => {
  const { newEmail } = req.body;
  const oldUser = await User.findOne({ email: newEmail });
  if (oldUser) {
    throw new Error(
      "The email you have provided already exists; please provide me with a different email address."
    );
  }
  if (!newEmail) {
    throw new Error("New email address is required.");
  }
  const token = req?.headers?.authorization;
  const userID = jwt.verify(token?.split(" ")[1], APP_SECRET);
  const user = await User.findById(userID);
  if (!user) {
    throw new Error("User not found.");
  }
  const otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
    digits: true,
  });
  user.emailChangeOTP = {
    newEmail,
    otp,
    expiry: new Date(Date.now() + 300000), // 5 minutes expiry
  };
  await user.save();
  await sendVerificationMailForSignUp(newEmail, otp);
  res.status(200).json({
    isSendOtp: true,
    success: true,
    message: "OTP sent to the new email address for verification.",
  });
};

// verifyEmailChangeOTP
export const verifyEmailChange = async (req, res) => {
  const { otp } = req.body;
  const token = req?.headers?.authorization;
  const userID = jwt.verify(token?.split(" ")[1], APP_SECRET);
  const user = await User.findById(userID);
  if (!user) {
    throw new Error("User not found.");
  }
  if (
    user.emailChangeOTP &&
    user.emailChangeOTP.otp === otp &&
    user.emailChangeOTP.expiry > Date.now()
  ) {
    user.email = user?.emailChangeOTP?.newEmail;
    user.emailChangeOTP = undefined;
    await user.save();
    res.status(200).json({
      success: true,
      message:
        "The email address has been changed successfully. Please log in again using this new email.",
    });
  } else if (user.emailChangeOTP && user.emailChangeOTP.expiry <= Date.now()) {
    user.emailChangeOTP = undefined;
    await user.save();
    res.status(200).json({
      success: true,
      message: "The OTP you entered is expired. Please try again.",
    });
  } else {
    throw new Error("The OTP you entered is incorrect. Please try again.");
  }
};

//changePassword
export const changePassword = async (req, res) => {
  const token = req.headers.authorization;
  const { password } = req.body;
  const userID = jwt.verify(token?.split(" ")[1], APP_SECRET);
  const findUser = await User.findOne({ _id: userID });
  if (!findUser) {
    throw new CustomError("The User  is Not Found", 404);
  }
  await User.findOneAndUpdate(
    { _id: findUser._id },

    {
      password: bcrypt.hashSync(password, 10),
    }
  );

  res.status(201).json({
    success: true,
    message: "Password Changed! Login Again",
  });
};

//get User
export const getUser = async (req, res) => {
  if (!req.user) {
    throw new CustomError("User not authenticated.");
  }

  res.setHeader("content-type", "application/json");
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

// Logout User
export const logout = async (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(new CustomError(err.message, err.statusCode));
    }
    res.status(200).json({
      success: true,
      message: "Logged out Successfully",
    });
  });
};

// changeAppPassword
export const changeAppPassword = async (req, res) => {
  const token = req.headers.authorization;
  const userID = jwt.verify(token?.split(" ")[1], APP_SECRET);
  const { oldPassword, newPassword } = req.body;
  const findUser = await User.findOne(
    { _id: userID },
    { password: 1, firstName: 1, email: 1 }
  );

  if (!findUser) {
    throw new CustomError("User Not Found", 404);
  }

  const isMatched = await findUser.matchesPassword(oldPassword);

  if (isMatched) {
    if (!newPassword) {
      return res.status(200).json({
        success: false,
        matched: true,
        message: "Please provide a new password to update your existing one.",
      });
    }

    const updatePassword = await User.findOneAndUpdate(
      { _id: userID },
      {
        password: bcrypt.hashSync(newPassword, 10),
      }
    );
    if (updatePassword) {
      return res.status(201).json({
        success: true,
        message:
          "Your password has been successfully changed. Please proceed to log in again.",
      });
    } else {
      return res.status(400).json({
        success: false,
        message:
          "Password change request could not be processed. Please try again.",
      });
    }
  } else {
    return res.status(400).json({
      success: false,
      matched: false,
      message: "Your Old Password does Not Match.",
    });
  }
};
