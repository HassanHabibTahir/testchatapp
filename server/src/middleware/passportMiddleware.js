import { Types } from "mongoose";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { User } from "../models/index.js";

const { APP_SECRET } = process.env;

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: APP_SECRET,
};

export const passportMiddleware = (passport) => {
  passport.use(
    new JwtStrategy(opts, (jwtPayload, done) => {
      const id = Types.ObjectId(jwtPayload._id);

      User.findById({ _id: id }, { password: 0, otpverification: 0 })
        .populate({
          path: "bookmarks",
          populate: [
            {
              path: "author",
              select: ["firstName", "lastName", "profilePic"],
            },
          ],
        })
        .exec((err, user) => {
          if (err) {
            return done(err, false);
          }
          if (user) {
            return done(null, user);
          } else {
            return done(null, false);
          }
        });
    })
  );
};
