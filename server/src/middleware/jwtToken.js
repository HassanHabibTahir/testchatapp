import jwt from "jsonwebtoken";

const { APP_SECRET, TOKEN_EXPIRATION } = process.env;

export const logIn = (user) =>
  new Promise((resolve, reject) => {
    jwt.sign(
      user,
      APP_SECRET,
      { expiresIn: TOKEN_EXPIRATION },
      (error, token) => {
        if (!error) {
          resolve(`Bearer ${token}`);
        } else {
          reject(error);
        }
      }
    );
  });
