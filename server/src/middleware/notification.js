import admin from "firebase-admin";
import { User } from "../models/index.js";
import { createRequire } from "module";
import { sendMailForNotification } from "./sendEmail.js";
const require = createRequire(import.meta.url);
const serviceAccount = require("../notify.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://checkout-app.firebaseio.com",
});
export const sendPushNotificationMiddleware = async (
  notification
  // userIsOnline
) => {
  try {
    const sender = await User.findById(notification?.sender);
    const receiver = await User.findById(notification?.receiver);
    const senderName = sender?.firstName + sender?.lastName;
    // const notificationEmail = {
    //   toMail: receiver?.email,
    //   body: `${notification?.message} from ${senderName}`,
    //   name: receiver?.firstName + " " + receiver?.lastName,
    //   type: notification.type,
    // };
    let _data = {
      notificationId: notification.notificationId,
      _id: notification._id,
      sender: {
        _id: sender?._id,
        firstName: sender?.firstName,
        lastName: sender?.lastName,
        profilePic: sender?.profilePic,
      },
      receiver: {
        _id: receiver?._id,
        firstName: receiver?.firstName,
        lastName: receiver?.lastName,
        profilePic: receiver?.profilePic,
      },
      type: notification?.type,
      createdAt: notification?.createdAt,
      message: notification?.message,
      seen: notification?.seen,
    };

    if (sender && receiver && receiver?.deviceToken) {
      // console.log(userIsOnline, "userIsOnline");
      // if (!userIsOnline) {
      const message = {
        notification: {
          title: "MarketSpace 360",
          body: `${notification?.message} from ${senderName}`,
        },
        data: {
          // type: `${notification?.type}":"${sender?._id}`,
          type: JSON.stringify(_data),
        },
        token: receiver?.deviceToken,
      };
      // await sendMailForNotification(notificationEmail);
      await admin.messaging().send(message);
      // }
    }
  } catch (error) {
    console.error("Error sending push notification:", error);
  }
};
